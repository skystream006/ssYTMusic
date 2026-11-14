const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const activity = fs.readFileSync(path.resolve(__dirname,
    '../../main/java/com/skystream/ssmusic/MainActivity.java'), 'utf8');
const method = activity.split('static String videoDisplayScript(')[1].split('\n    /**')[0];
function script(thumbnail) {
    const expression = method.slice(method.indexOf('return "(function(){'));
    return expression.replace(/\+ showThumbnailByDefault \+/g, `+ "${thumbnail}" +`)
        .replace(/jsStringLiteral\(\w+\)/g, '"\'Label\'"')
        .match(/"(?:\\.|[^"\\])*"/g).map(value => JSON.parse(value)).join('');
}

let browser;
before(async () => {
    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN });
});
after(async () => {
    await browser?.close();
});

const fixture = `
<style>
  ytmusic-app-layout, ytmusic-player-page, ytmusic-player, ytmusic-player-bar { display:block; }
  #movie_player { position:relative; width:300px; height:200px;
    transform:scale(.8); transform-origin:top left; }
  video { width:300px; height:200px; }
  .tab-header, .next-button, .previous-button { width:60px; height:40px; }
</style>
<ytmusic-app-layout player-ui-state="PLAYER_PAGE_OPEN">
  <ytmusic-player-page player-ui-state="PLAYER_PAGE_OPEN">
    <ytmusic-player id="player">
      <div id="movie_player" role="button"><video style="opacity:.7!important"></video></div>
    </ytmusic-player>
    <button class="tab-header ytmusic-player-page" onclick="window.actions.push('up')">Up next</button>
  </ytmusic-player-page>
  <ytmusic-player-bar>
    <img class="image" src="/art.svg">
    <button class="previous-button" onclick="window.actions.push('previous')">Previous</button>
    <button class="next-button" onclick="window.actions.push('next')">Next</button>
  </ytmusic-player-bar>
</ytmusic-app-layout>`;

async function open(t, thumbnail = false) {
    const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    t.after(async () => {
        await page.close();
        assert.deepEqual(errors, []);
    });
    await page.route('**/*', route => route.fulfill(route.request().url().endsWith('/art.svg')
        ? { contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"/>' }
        : { contentType: 'text/html', body: fixture }));
    await page.goto('https://music.youtube.com/fixture');
    await page.evaluate(() => {
        window.actions = [];
        window.__ssmusicCompactPlayer = {
            minimize() { window.actions.push('down'); return 'minimized'; }
        };
    });
    await page.evaluate(script(thumbnail));
    if (thumbnail) {
        await page.waitForFunction(() => {
            const cover = document.getElementById('ssmusic-video-thumbnail-cover');
            return cover && getComputedStyle(cover).display !== 'none';
        });
    }
    return page;
}

async function start(page, id) {
    return page.evaluate(id => {
        const rect = document.getElementById('movie_player').getBoundingClientRect();
        return window.__ssmusicNativeSwipeStart(id,
            (rect.left + rect.width / 2) / innerWidth,
            (rect.top + rect.height / 2) / innerHeight);
    }, id);
}

async function move(page, id, x, y) {
    return page.evaluate(async ([id, x, y]) => {
        const result = window.__ssmusicNativeSwipeMove(id, x / innerWidth, y / innerHeight);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return result;
    }, [id, x, y]);
}

async function rect(page, selector = '#movie_player') {
    return page.locator(selector).evaluate(node => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return { x, y, width, height };
    });
}

async function settled(page) {
    await page.waitForFunction(() => document.getElementById('movie_player').getAnimations().length === 0);
}

test('left advances and right goes back for both video and thumbnail', async t => {
    for (const thumbnail of [false, true]) {
        const page = await open(t, thumbnail);
        for (const [id, direction, x, expected] of [[1, 'left', -60, 'next'], [2, 'right', 60, 'previous']]) {
            assert.equal(await start(page, id), 'accepted');
            assert.equal(await move(page, id, x, 0), 'drag updated');
            assert.equal(await page.evaluate(([id, direction]) =>
                window.__ssmusicNativeSwipeEnd(id, direction), [id, direction]),
            `Media player swipe ${direction}: ${expected} control clicked`);
            await settled(page);
        }
        assert.deepEqual(await page.evaluate(() => window.actions), ['next', 'previous']);
    }
});

test('media and cover follow the drag without overwriting site transform or opacity', async t => {
    const page = await open(t, true);
    const original = await rect(page);
    const originalCover = await rect(page, '#ssmusic-video-thumbnail-cover');
    assert.equal(await start(page, 1), 'accepted');
    await move(page, 1, -60, 0);
    const dragged = await rect(page);
    const draggedCover = await rect(page, '#ssmusic-video-thumbnail-cover');
    assert.ok(Math.abs(dragged.x - original.x + 60) < 1);
    assert.ok(Math.abs(draggedCover.x - originalCover.x + 60) < 1);
    assert.equal(dragged.width, original.width);
    assert.equal(dragged.y, original.y);
    await page.evaluate(() => window.__ssmusicNativeSwipeCancel(1, true));
    await settled(page);
    assert.deepEqual(await rect(page), original);
    assert.equal(await page.locator('#movie_player').evaluate(node => node.style.transform), '');
    assert.deepEqual(await page.locator('video').evaluate(node => [
        node.style.getPropertyValue('opacity'), node.style.getPropertyPriority('opacity')
    ]), ['0', 'important']);
    assert.deepEqual(await page.evaluate(() => window.actions), []);
});

test('vertical drag retains up-next and minimize actions and caps visual travel', async t => {
    const page = await open(t);
    const original = await rect(page);
    assert.equal(await start(page, 1), 'accepted');
    await move(page, 1, 0, -600);
    const dragged = await rect(page);
    assert.ok(Math.abs(dragged.y - original.y + original.height / 3) < 1);
    assert.equal(dragged.x, original.x);
    await page.evaluate(() => window.__ssmusicNativeSwipeEnd(1, 'up'));
    await settled(page);
    assert.equal(await start(page, 2), 'accepted');
    await move(page, 2, 0, 60);
    await page.evaluate(() => window.__ssmusicNativeSwipeEnd(2, 'down'));
    await settled(page);
    assert.deepEqual(await page.evaluate(() => window.actions), ['up', 'down']);
});

test('stale callbacks cannot move, cancel, or finish a newer drag', async t => {
    const page = await open(t);
    const original = await rect(page);
    assert.equal(await start(page, 1), 'accepted');
    await move(page, 1, 60, 0);
    assert.equal(await start(page, 2), 'accepted');
    assert.deepEqual(await rect(page), original);
    await move(page, 2, -60, 0);
    const dragged = await rect(page);
    assert.equal(await move(page, 1, 60, 0), 'rejected: stale media gesture');
    await page.evaluate(() => window.__ssmusicNativeSwipeCancel(1, false));
    assert.match(await page.evaluate(() => window.__ssmusicNativeSwipeEnd(1, 'right')), /rejected/);
    assert.deepEqual(await rect(page), dragged);
    await page.evaluate(() => window.__ssmusicNativeSwipeEnd(2, 'left'));
    await settled(page);
    assert.deepEqual(await page.evaluate(() => window.actions), ['next']);
});

test('navigation, hidden/compact state, and replacement clean up without an action', async t => {
    for (const mutation of ['navigation', 'hidden', 'compact', 'replacement']) {
        const page = await open(t);
        const original = await rect(page);
        assert.equal(await start(page, 1), 'accepted');
        await move(page, 1, 60, 0);
        await page.evaluate(async mutation => {
            const node = document.getElementById('movie_player');
            if (mutation === 'navigation') document.dispatchEvent(new Event('yt-navigate-start'));
            if (mutation === 'hidden') node.hidden = true;
            if (mutation === 'compact') node.closest('ytmusic-player-page')
                .setAttribute('data-ssmusic-compact-role', 'page');
            if (mutation === 'replacement') node.replaceWith(node.cloneNode(true));
            await new Promise(resolve => setTimeout(resolve, 0));
            window.__ssmusicNativeSwipeEnd(1, 'right');
            node.hidden = false;
            document.querySelector('ytmusic-player-page').removeAttribute('data-ssmusic-compact-role');
        }, mutation);
        assert.deepEqual(await rect(page), original);
        assert.deepEqual(await page.evaluate(() => window.actions), []);
        await settled(page);
    }
});

test('controls remain excluded and reduced motion restores immediately', async t => {
    const page = await open(t);
    assert.match(await page.evaluate(() => {
        const r = document.querySelector('.next-button').getBoundingClientRect();
        return window.__ssmusicNativeSwipeStart(1, (r.x + 5) / innerWidth, (r.y + 5) / innerHeight);
    }), /rejected: nested control/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const original = await rect(page);
    assert.equal(await start(page, 2), 'accepted');
    await move(page, 2, -60, 0);
    await page.evaluate(() => window.__ssmusicNativeSwipeCancel(2, true));
    assert.deepEqual(await rect(page), original);
    assert.equal(await page.locator('#movie_player').evaluate(node => node.getAnimations().length), 0);
});

test('pending frames use the latest drag and cannot reapply after cancellation', async t => {
    const page = await open(t);
    const original = await rect(page);
    assert.equal(await start(page, 1), 'accepted');
    await page.evaluate(async () => {
        window.__ssmusicNativeSwipeMove(1, -20 / innerWidth, 0);
        window.__ssmusicNativeSwipeMove(1, -60 / innerWidth, 0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    assert.ok(Math.abs((await rect(page)).x - original.x + 60) < 1);
    await page.evaluate(() => {
        window.__ssmusicNativeSwipeMove(1, 60 / innerWidth, 0);
        window.__ssmusicNativeSwipeCancel(1, false);
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    assert.deepEqual(await rect(page), original);
    assert.deepEqual(await page.evaluate(() => window.actions), []);
});

test('settling stops immediately when presentation changes or native cancellation arrives', async t => {
    for (const mutation of ['compact', 'cancel']) {
        const page = await open(t);
        const original = await rect(page);
        assert.equal(await start(page, 1), 'accepted');
        await move(page, 1, -60, 0);
        await page.evaluate(async mutation => {
            window.__ssmusicNativeSwipeEnd(1, 'left');
            if (mutation === 'compact') document.querySelector('ytmusic-player-page')
                .setAttribute('data-ssmusic-compact-role', 'page');
            else window.__ssmusicNativeSwipeCancel(1, false);
            await new Promise(resolve => setTimeout(resolve, 0));
            document.querySelector('ytmusic-player-page').removeAttribute('data-ssmusic-compact-role');
        }, mutation);
        assert.deepEqual(await rect(page), original);
        assert.equal(await page.locator('#movie_player').evaluate(node => node.getAnimations().length), 0);
    }
});
