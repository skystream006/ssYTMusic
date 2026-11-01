const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const main = path.resolve(__dirname, '../../main');
const script = fs.readFileSync(path.join(main, 'assets/page_elements.js'), 'utf8');
const activity = fs.readFileSync(path.join(main, 'java/com/skystream/ssmusic/MainActivity.java'), 'utf8');
const pruneConstant = activity.split('static final String AD_JSON_PRUNE_SCRIPT =')[1].split('/**')[0];
const pruneScript = pruneConstant.match(/"(?:\\.|[^"\\])*"/g).map(value => JSON.parse(value)).join('');
const defaults = {
    shorts: true, playables: true, recommended_content: false, distracting_elements: true,
    thumbnails: false, autodubbed_videos: true, members_only_videos: true
};
const off = Object.fromEntries(Object.keys(defaults).map(key => [key, false]));
let browser;

before(async () => {
    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN });
});
after(async () => {
    await browser?.close();
});

const fixture = `
<style>
  ytmusic-two-row-item-renderer, ytmusic-responsive-list-item-renderer,
  ytmusic-nav-bar, ytmusic-menu-renderer, ytmusic-player-page, ytmusic-player,
  ytmusic-player-queue, ytmusic-comments-section-renderer, ytmusic-description-shelf-renderer,
  ytmusic-carousel-shelf-renderer, ytmusic-settings-button { display: block; }
  img { width: 40px; height: 40px; }
</style>
<ytmusic-nav-bar>
  <ytmusic-logo id="logo">ssYTMusic</ytmusic-logo>
  <ytmusic-settings-button id="account">Account</ytmusic-settings-button>
  <a id="sign-in" href="https://accounts.google.com/ServiceLogin">Sign in</a>
  <ytmusic-search-box id="search"><input aria-label="Search"></ytmusic-search-box>
</ytmusic-nav-bar>
<main id="home">
  <ytmusic-carousel-shelf-renderer id="shorts-shelf"><h2>Shorts for you</h2></ytmusic-carousel-shelf-renderer>
  <ytmusic-two-row-item-renderer id="short"><a href="/shorts/one">Short</a></ytmusic-two-row-item-renderer>
  <ytmusic-guide-entry-renderer id="shorts-nav"><a href="https://www.youtube.com/shorts/">Shorts</a></ytmusic-guide-entry-renderer>
  <yt-tab-shape id="shorts-tab">Shorts</yt-tab-shape>
  <span class="ytChipShapeHost" id="shorts-chip">Shorts</span>
  <ytmusic-carousel-shelf-renderer id="games-shelf"><h2>YouTube Playables</h2></ytmusic-carousel-shelf-renderer>
  <ytmusic-two-row-item-renderer id="game"><a href="/playables/game">Game</a></ytmusic-two-row-item-renderer>
  <ytmusic-guide-entry-renderer id="games-nav"><a href="/feed/playables">Playables</a></ytmusic-guide-entry-renderer>
  <ytmusic-chip-cloud-chip-renderer id="games-chip">Playables</ytmusic-chip-cloud-chip-renderer>
  <ytmusic-two-row-item-renderer id="dubbed"><ytmusic-badge-renderer>Auto-dubbed</ytmusic-badge-renderer></ytmusic-two-row-item-renderer>
  <ytmusic-two-row-item-renderer id="member"><ytmusic-badge-renderer>Members only</ytmusic-badge-renderer></ytmusic-two-row-item-renderer>
  <ytmusic-responsive-list-item-renderer id="french-member"><ytmusic-badge-renderer>R&#233;serv&#233; aux membres</ytmusic-badge-renderer></ytmusic-responsive-list-item-renderer>
  <ytmusic-responsive-list-item-renderer id="normal">
    <a href="/watch?v=normal" id="song-title">Members only: a song about auto-dubbed Shorts</a>
    <button id="play" onclick="window.playClicks=(window.playClicks||0)+1">
      <ytmusic-thumbnail-renderer><img id="art" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" style="opacity:0.7!important"></ytmusic-thumbnail-renderer>
      Play
    </button>
    <ytmusic-menu-renderer id="menu"><button>More</button></ytmusic-menu-renderer>
    <ytmusic-thumbnail-renderer><img id="plain-art" alt="More artwork"></ytmusic-thumbnail-renderer>
  </ytmusic-responsive-list-item-renderer>
  <ytmusic-two-row-item-renderer id="external-short"><a href="https://example.org/shorts/one">Not YouTube</a></ytmusic-two-row-item-renderer>
  <div id="video-preview-container">Hover preview</div>
</main>
<ytmusic-player-page>
  <div id="tabsContainer"><button role="tab" id="up-next">Up next</button><button role="tab" id="lyrics">Lyrics</button><button role="tab" id="related-tab">Related</button></div>
  <ytmusic-player-queue>
    <div id="queue">Your playlist</div><div id="automix">Suggested next tracks</div>
    <ytmusic-responsive-list-item-renderer id="queued-member"><ytmusic-badge-renderer>Members only</ytmusic-badge-renderer></ytmusic-responsive-list-item-renderer>
  </ytmusic-player-queue>
  <div id="related">Suggested albums</div>
  <ytmusic-comments-section-renderer id="comments">Comments</ytmusic-comments-section-renderer>
  <ytmusic-description-shelf-renderer id="description">Video info</ytmusic-description-shelf-renderer>
  <ytmusic-player>
    <video id="media" style="opacity:0.42"></video><img id="cover" class="ssmusic-video-thumbnail" alt="Song thumbnail">
    <button id="transport">Pause</button><button id="compact">Compact player</button>
  </ytmusic-player>
  <div class="ytp-endscreen-content" id="endcard">End card</div>
</ytmusic-player-page>`;

async function open(t, options = defaults, html = fixture, origin = 'https://music.youtube.com') {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    t.after(async () => {
        await page.close();
        assert.deepEqual(errors, [], 'No script errors');
    });
    await page.route('**/*', route => {
        assert.equal(route.request().resourceType(), 'document', 'Fixtures must not use the network');
        return route.fulfill({ contentType: 'text/html', body: html });
    });
    await page.addInitScript(`window.__ssmusicPageElementOptions=${JSON.stringify(options)};${script}${pruneScript}`);
    await page.goto(origin);
    await page.evaluate(() => window.__ssmusicPageElements?.update(window.__ssmusicPageElementOptions));
    return page;
}

async function setOptions(page, options) {
    await page.evaluate(value => {
        window.__ssmusicPageElementOptions = value;
        window.__ssmusicPageElements.update(value);
    }, options);
}

async function hidden(page, ...ids) {
    for (const id of ids) {
        assert.equal(await page.locator('#' + id).isVisible(), false, id + ' should be hidden');
    }
}

async function visible(page, ...ids) {
    for (const id of ids) {
        assert.equal(await page.locator('#' + id).isVisible(), true, id + ' should be visible');
    }
}

test('the requested defaults block five categories, not recommendations or thumbnails', async t => {
    const page = await open(t);
    await hidden(page, 'shorts-shelf', 'short', 'shorts-nav', 'games-shelf', 'game', 'games-nav',
        'dubbed', 'member', 'french-member', 'account', 'sign-in', 'menu', 'comments', 'description');
    await visible(page, 'normal', 'home', 'related', 'related-tab', 'automix', 'queue',
        'up-next', 'lyrics', 'song-title', 'play', 'transport', 'compact', 'search', 'logo',
        'external-short', 'queued-member', 'endcard', 'video-preview-container');
    assert.equal(await page.locator('#art').evaluate(node => getComputedStyle(node).opacity), '0.7');
});

test('each of the seven controls works independently and restores on disable', async t => {
    const page = await open(t, off);
    const cases = {
        shorts: ['shorts-shelf', 'short', 'shorts-nav', 'shorts-tab', 'shorts-chip'],
        playables: ['game', 'games-shelf', 'games-nav', 'games-chip'],
        recommended_content: ['related', 'related-tab', 'automix', 'endcard'],
        distracting_elements: ['account', 'sign-in', 'menu', 'comments', 'description'],
        autodubbed_videos: ['dubbed'],
        members_only_videos: ['member', 'french-member'],
        thumbnails: ['video-preview-container']
    };
    for (const [key, ids] of Object.entries(cases)) {
        await setOptions(page, { ...off, [key]: true });
        await hidden(page, ...ids);
        for (const [other, otherIds] of Object.entries(cases)) {
            if (key !== other) await visible(page, ...otherIds);
        }
        assert.equal(await page.locator('#art').evaluate(node => getComputedStyle(node).opacity),
            key === 'thumbnails' ? '0' : '0.7');
        await setOptions(page, off);
        await visible(page, ...ids);
    }
});

test('thumbnail blocking keeps click targets, player art, media and inline styles intact', async t => {
    const page = await open(t, off);
    const before = await page.evaluate(() => {
        window.originalMedia = document.querySelector('video');
        window.originalPlay = HTMLMediaElement.prototype.play;
        return document.querySelector('#art').getAttribute('src');
    });
    await setOptions(page, { ...off, thumbnails: true });
    assert.equal(await page.locator('#art').evaluate(node => getComputedStyle(node).opacity), '0');
    assert.equal(await page.locator('#plain-art').evaluate(node => getComputedStyle(node).opacity), '0');
    await page.locator('#play').click();
    assert.equal(await page.evaluate(() => window.playClicks), 1);
    assert.equal(await page.locator('#cover').evaluate(node => getComputedStyle(node).opacity), '1');
    assert.equal(await page.locator('#media').evaluate(node => getComputedStyle(node).opacity), '0.42');
    assert.equal(await page.locator('#art').getAttribute('src'), before);
    assert.equal(await page.evaluate(() => window.originalMedia === document.querySelector('video')
        && window.originalPlay === HTMLMediaElement.prototype.play), true);
    await setOptions(page, off);
    assert.equal(await page.locator('#art').evaluate(node => node.style.getPropertyPriority('opacity')),
        'important');
    assert.equal(await page.locator('#art').evaluate(node => getComputedStyle(node).opacity), '0.7');
    assert.equal(await page.locator('#plain-art').evaluate(node => node.style.getPropertyValue('opacity')), '');
});

test('recycled rows, badge changes, late content and SPA navigation are reapplied', async t => {
    const page = await open(t);
    await page.evaluate(() => {
        history.pushState({}, '', '/search?q=music');
        const row = document.createElement('ytmusic-responsive-list-item-renderer');
        row.id = 'late';
        row.innerHTML = '<ytmusic-badge-renderer>Auto-dubbed</ytmusic-badge-renderer>';
        document.querySelector('#home').appendChild(row);
    });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#late')).display === 'none');
    await page.locator('#late ytmusic-badge-renderer').evaluate(node => { node.textContent = 'HD'; });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#late')).display !== 'none');
    await page.locator('#late').evaluate(node => { node.setAttribute('data-members-only', 'true'); });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#late')).display === 'none');
    await page.locator('#late').evaluate(node => {
        node.removeAttribute('data-members-only');
        node.data = { isAutoDubbed: true };
        document.dispatchEvent(new Event('yt-page-data-updated'));
    });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#late')).display === 'none');
    await setOptions(page, off);
    await visible(page, 'late');
});

test('overlapping rules restore only their own presentation and preserve Kid mode hiding', async t => {
    const page = await open(t, off);
    await page.locator('#short').evaluate(node => {
        node.innerHTML += '<ytmusic-badge-renderer>Members only</ytmusic-badge-renderer>';
    });
    await setOptions(page, { ...off, shorts: true, members_only_videos: true });
    await setOptions(page, { ...off, members_only_videos: true });
    await hidden(page, 'short');
    await page.locator('#short').evaluate(node => node.style.setProperty('display', 'none', 'important'));
    await page.locator('#menu').evaluate(node => {
        node.hidden = true;
        node.inert = true;
        node.style.setProperty('display', 'none', 'important');
    });
    await setOptions(page, defaults);
    await setOptions(page, off);
    await hidden(page, 'short', 'menu');
    assert.equal(await page.locator('#short').getAttribute('data-ssmusic-page-hidden'), null);
    assert.equal(await page.locator('#menu').evaluate(node => node.inert), true);
});

test('reinjection, head replacement and cached-page restoration use one live controller', async t => {
    const page = await open(t);
    await page.evaluate(() => { window.controller = window.__ssmusicPageElements; });
    await page.evaluate(script);
    assert.equal(await page.evaluate(() => window.controller === window.__ssmusicPageElements), true);
    assert.equal(await page.locator('#ssmusic-page-elements').count(), 1);
    await page.locator('#ssmusic-page-elements').evaluate(node => node.remove());
    await page.waitForFunction(() => !!document.querySelector('#ssmusic-page-elements'));
    await page.evaluate(() => {
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        document.querySelector('#member ytmusic-badge-renderer').textContent = 'HD';
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    await visible(page, 'member');
    await hidden(page, 'dubbed');
    assert.equal(await page.locator('#ssmusic-page-elements').count(), 1);
});

test('account pages and child frames are never filtered', async t => {
    const page = await open(t, defaults, fixture, 'https://accounts.google.com');
    assert.equal(await page.evaluate(() => !!window.__ssmusicPageElements), false);
    assert.equal(await page.evaluate(() => !!window.__ssmusicPruneResponse), false);
    assert.equal(await page.locator('#ssmusic-page-elements').count(), 0);
    await visible(page, 'account', 'member', 'short');
    const music = await open(t);
    await music.evaluate(() => {
        const iframe = document.createElement('iframe');
        iframe.srcdoc = '<ytmusic-menu-renderer id="frame-menu">Menu</ytmusic-menu-renderer>';
        document.body.appendChild(iframe);
    });
    const frame = music.frames().find(frame => frame.parentFrame());
    await frame.waitForSelector('#frame-menu');
    await frame.evaluate(`window.__ssmusicPageElementOptions=${JSON.stringify(defaults)};${script}`);
    assert.equal(await frame.evaluate(() => !!window.__ssmusicPageElements), false);
});

const response = {
    playerAds: ['ad'],
    streamingData: { adaptiveFormats: [
        { itag: 1, audioTrack: { isAutoDubbed: true } },
        { itag: 2, audioTrack: { isAutoDubbed: false } },
        { itag: 3, mimeType: 'video/webm' },
        { itag: 4, audioTrack: { isAutoDubbed: 'true' } }
    ] }
};

test('auto-dub filtering covers JSON.parse, fetch JSON/text, typed XHR and initial responses', async t => {
    const page = await open(t);
    await page.route('**/youtubei/v1/player', route =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(response) }));
    const results = await page.evaluate(async raw => {
        const values = [
            JSON.parse(raw),
            await fetch('/youtubei/v1/player').then(response => response.json()),
            JSON.parse(await fetch('/youtubei/v1/player').then(response => response.text())),
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', '/youtubei/v1/player');
                xhr.responseType = 'json';
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = reject;
                xhr.send();
            })
        ];
        return values.map(value => ({
            itags: value.streamingData.adaptiveFormats.map(format => format.itag),
            ads: Object.hasOwn(value, 'playerAds')
        }));
    }, JSON.stringify(response));
    assert.deepEqual(results, Array(4).fill({ itags: [2, 3, 4], ads: false }));
    await page.evaluate(value => { window.ytInitialPlayerResponse = value; }, response);
    await page.evaluate(pruneScript);
    assert.deepEqual(await page.evaluate(() =>
        window.ytInitialPlayerResponse.streamingData.adaptiveFormats.map(format => format.itag)), [2, 3, 4]);
    await setOptions(page, off);
    const disabled = await page.evaluate(raw => {
        const parsed = JSON.parse(raw);
        return { itags: parsed.streamingData.adaptiveFormats.map(format => format.itag),
            ads: Object.hasOwn(parsed, 'playerAds') };
    }, JSON.stringify(response));
    assert.deepEqual(disabled, { itags: [1, 2, 3, 4], ads: false });
});

test('desktop and mobile renderer variants use the same independent options', async t => {
    const page = await open(t, defaults, `
      <style>ytd-video-renderer,yt-lockup-view-model,ytm-media-item,ytm-reel-shelf-renderer,
      ytm-slim-video-metadata-section-renderer,ytm-item-section-renderer{display:block}</style>
      <ytd-video-renderer id="desktop-short"><a href="/shorts/1">Short</a></ytd-video-renderer>
      <ytm-reel-shelf-renderer id="mobile-short">Shorts</ytm-reel-shelf-renderer>
      <yt-lockup-view-model id="desktop-member"><ytd-badge-supported-renderer class="badge-style-type-members-only">Join</ytd-badge-supported-renderer></yt-lockup-view-model>
      <ytm-media-item id="mobile-dub"><span class="badge">Auto-dubbed</span></ytm-media-item>
      <ytm-slim-video-metadata-section-renderer id="mobile-description">Info</ytm-slim-video-metadata-section-renderer>
      <ytm-item-section-renderer section-identifier="related-items" id="mobile-next">Up next</ytm-item-section-renderer>
      <div class="ytm-player-endscreen" id="mobile-end">End</div>`);
    await hidden(page, 'desktop-short', 'mobile-short', 'desktop-member', 'mobile-dub', 'mobile-description');
    await visible(page, 'mobile-next', 'mobile-end');
    await setOptions(page, { ...off, recommended_content: true });
    await hidden(page, 'mobile-next', 'mobile-end');
    await visible(page, 'desktop-short', 'mobile-short', 'desktop-member', 'mobile-dub', 'mobile-description');
});
