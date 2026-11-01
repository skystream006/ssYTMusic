(function () {
    'use strict';
    if (location.origin !== 'https://music.youtube.com' || window.top !== window) {
        return;
    }
    var options = window.__ssmusicPageElementOptions;
    if (window.__ssmusicPageElements) {
        window.__ssmusicPageElements.update(options);
        return;
    }

    var HIDDEN = 'data-ssmusic-page-hidden';
    var CARDS = 'ytmusic-two-row-item-renderer,ytmusic-responsive-list-item-renderer,'
        + 'ytd-rich-item-renderer,ytd-video-renderer,ytd-compact-video-renderer,'
        + 'ytd-grid-video-renderer,yt-lockup-view-model,'
        + 'ytm-video-with-context-renderer,ytm-video-renderer,ytm-compact-video-renderer,'
        + 'ytm-media-item,.ytLockupViewModelWrapper';
    var SHELVES = 'ytmusic-carousel-shelf-renderer,ytd-rich-section-renderer,'
        + 'ytd-rich-shelf-renderer,ytd-horizontal-card-list-renderer,.ytGridShelfViewModelHost';
    var NAVIGATION = 'ytmusic-guide-entry-renderer,ytmusic-mini-guide-entry-renderer,'
        + 'ytd-guide-entry-renderer,ytd-mini-guide-entry-renderer,'
        + 'ytm-pivot-bar-item-renderer,yt-chip-cloud-chip-renderer,ytm-chip-cloud-chip-renderer';
    var PLAYER = 'ytmusic-player,ytmusic-player-bar,ytmusic-player-queue,'
        + 'ytmusic-playlist-panel-renderer';
    var BADGES = 'ytmusic-badge-renderer,ytmusic-inline-badge-renderer,'
        + 'yt-badge-shape,ytm-badge-supported-renderer,'
        + 'ytd-badge-supported-renderer,.badge,.badge-shape-wiz,.yt-badge-shape,'
        + '.yt-content-metadata-view-model__metadata-row';
    var IMAGES = 'ytmusic-thumbnail-renderer img,yt-img-shadow img,'
        + 'ytd-thumbnail img,.ytThumbnailViewModelImage,'
        + '.ytCoreImageHost,.video-thumbnail-img,.video-thumbnail-container-large img';
    var hidden = new Map();
    var thumbnails = new Map();
    var timer = null;
    var suspended = false;
    var style = document.createElement('style');
    style.id = 'ssmusic-page-elements';
    style.textContent = '[' + HIDDEN + '="true"]{display:none!important;}';

    function collect(selector, target) {
        document.querySelectorAll(selector).forEach(function (node) { target.add(node); });
    }

    function reconcile(previous, next, attribute) {
        previous.forEach(function (value, node) {
            if (!next.has(node)) {
                if (node.getAttribute(attribute) === 'true') {
                    if (value === null) {
                        node.removeAttribute(attribute);
                    } else {
                        node.setAttribute(attribute, value);
                    }
                }
                previous.delete(node);
            }
        });
        next.forEach(function (node) {
            if (!previous.has(node)) {
                previous.set(node, node.getAttribute(attribute));
            }
            if (node.getAttribute(attribute) !== 'true') {
                node.setAttribute(attribute, 'true');
            }
        });
    }

    function label(node) {
        return (node.textContent || node.getAttribute('aria-label') || '').trim();
    }

    function updateThumbnails(next) {
        thumbnails.forEach(function (previous, image) {
            if (!next.has(image)) {
                if (image.style.getPropertyValue('opacity') === '0'
                        && image.style.getPropertyPriority('opacity') === 'important') {
                    if (previous.value) {
                        image.style.setProperty('opacity', previous.value, previous.priority);
                    } else {
                        image.style.removeProperty('opacity');
                    }
                }
                thumbnails.delete(image);
            }
        });
        next.forEach(function (image) {
            if (!thumbnails.has(image)) {
                thumbnails.set(image, {
                    value: image.style.getPropertyValue('opacity'),
                    priority: image.style.getPropertyPriority('opacity')
                });
            }
            if (image.style.getPropertyValue('opacity') !== '0'
                    || image.style.getPropertyPriority('opacity') !== 'important') {
                image.style.setProperty('opacity', '0', 'important');
            }
        });
    }

    function badgeMatches(card, pattern) {
        return Array.from(card.querySelectorAll(BADGES)).some(function (badge) {
            return pattern.test(label(badge)) || pattern.test(badge.getAttribute('aria-label') || '');
        });
    }

    function data(node) {
        return node.data || node.__data && node.__data.data || {};
    }

    function related(node) {
        var value = data(node).tabRenderer || data(node);
        var endpoint = value.endpoint || value.navigationEndpoint || {};
        var config = (endpoint.browseEndpoint || {}).browseEndpointContextSupportedConfigs || {};
        return value.pageType === 'MUSIC_PAGE_TYPE_TRACK_RELATED'
            || (config.browseEndpointContextMusicConfig || {}).pageType === 'MUSIC_PAGE_TYPE_TRACK_RELATED'
            || /^(related|related-tab)$/i.test(node.getAttribute('tab-id') || node.id || '')
            || /^related$/i.test(label(node));
    }

    function apply() {
        timer = null;
        if (suspended) {
            return;
        }
        var blocked = new Set();
        var artwork = new Set();
        if (options.shorts) {
            collect('ytm-reel-shelf-renderer,ytd-reel-shelf-renderer,ytd-reel-item-renderer,'
                + 'ytm-shorts-lockup-view-model,ytm-shorts-lockup-view-model-v2,'
                + '.big-shorts-singleton,.pivot-shorts', blocked);
        }
        if (options.playables) {
            collect('ytm-playable-card-renderer,'
                + 'ytd-playable-card-renderer,ytmusic-playable-card-renderer', blocked);
        }
        if (options.thumbnails) {
            collect('#video-preview-container,ytm-video-preview', blocked);
        }
        if (options.distracting_elements) {
            collect('ytmusic-settings-button,ytmusic-nav-bar .sign-in-link,'
                + 'ytmusic-nav-bar a[href*="accounts.google.com"],ytmusic-menu-renderer,'
                + 'ytmusic-comments-entry-point-header-renderer,ytmusic-comments-header-renderer,'
                + 'ytmusic-comments-section-renderer,ytmusic-comment-thread-renderer,'
                + 'ytmusic-player-page ytmusic-description-shelf-renderer,'
                + '.mobile-topbar-header-sign-in-button,.mobile-topbar-header-content > ytm-menu,'
                + 'ytm-topbar-menu-button-renderer,.pivot-bar-slide-in,'
                + 'ytm-comments-entry-point-header-renderer,'
                + 'ytm-item-section-renderer.single-column-watch-next-modern-panels,'
                + 'ytm-slim-video-metadata-section-renderer', blocked);
        }
        if (options.recommended_content) {
            collect('ytm-item-section-renderer[section-identifier="related-items"],'
                + '.ytm-player-endscreen,.ytp-endscreen-content,.ytp-ce-element,'
                + 'ytd-watch-next-secondary-results-renderer,ytmusic-player-queue #automix,'
                + 'ytmusic-player-page #related,ytmusic-player-page #related-tab,'
                + 'ytmusic-player-page [page-type="MUSIC_PAGE_TYPE_TRACK_RELATED"]', blocked);
            document.querySelectorAll('ytmusic-player-page #tabsContainer').forEach(function (tabs) {
                var items = tabs.querySelectorAll('[role="tab"],tp-yt-paper-tab,.tab-header');
                items.forEach(function (tab, index) {
                    // The Music player orders its three tabs as Up next, Lyrics, Related.
                    if (related(tab) || items.length === 3 && index === 2) {
                        blocked.add(tab);
                    }
                });
            });
            document.querySelectorAll('ytmusic-player-page ytmusic-tab-renderer').forEach(function (tab) {
                if (related(tab)) {
                    blocked.add(tab);
                }
            });
            document.querySelectorAll('.feed-nudge-wrapper').forEach(function (node) {
                if (/try searching to get started/i.test(label(node))) {
                    blocked.add(node);
                }
            });
        }
        if (options.shorts || options.playables) {
            document.querySelectorAll('a[href]').forEach(function (anchor) {
                if (!/^(music\.|www\.|m\.)?youtube\.com$/.test(anchor.hostname)) {
                    return;
                }
                var isShort = /^\/shorts(?:\/|$)/.test(anchor.pathname);
                var isPlayable = /^\/(?:playables|feed\/playables)(?:\/|$)/.test(anchor.pathname);
                if (options.shorts && isShort || options.playables && isPlayable) {
                    blocked.add(anchor.closest(CARDS + ',' + NAVIGATION) || anchor);
                }
            });
            document.querySelectorAll('.ytChipShapeHost,yt-tab-shape,'
                + 'yt-chip-cloud-chip-renderer,ytm-chip-cloud-chip-renderer,'
                + 'ytmusic-chip-cloud-chip-renderer').forEach(function (chip) {
                if (options.shorts && /^shorts$/i.test(label(chip))
                        || options.playables && /^(youtube )?playables$/i.test(label(chip))) {
                    blocked.add(chip);
                }
            });
            document.querySelectorAll(SHELVES).forEach(function (shelf) {
                var heading = shelf.querySelector('h2,h3,#title,ytmusic-carousel-shelf-basic-header-renderer');
                var title = heading ? label(heading) : '';
                if (options.shorts && /\bshorts\b/i.test(title)
                        || options.playables && /\bplayables\b/i.test(title)) {
                    blocked.add(shelf);
                }
            });
        }
        if (options.autodubbed_videos || options.members_only_videos || options.thumbnails) {
            document.querySelectorAll(CARDS).forEach(function (card) {
                if (card.closest(PLAYER)) {
                    return;
                }
                var value = data(card);
                if (options.autodubbed_videos && (value.isAutoDubbed === true
                        || card.matches('[data-is-auto-dubbed="true"]')
                        || card.querySelector('[data-is-auto-dubbed="true"]')
                        || badgeMatches(card, /\bauto[- ]dubbed\b/i))) {
                    blocked.add(card);
                }
                if (options.members_only_videos && (value.isMembersOnly === true
                        || card.matches('[data-members-only="true"]')
                        || card.querySelector('.badge-style-type-members-only,[data-members-only="true"]')
                        || badgeMatches(card, /members[- ]only|r\u00e9serv\u00e9 aux membres/i))) {
                    blocked.add(card);
                }
                if (options.thumbnails) {
                    card.querySelectorAll(IMAGES).forEach(function (image) { artwork.add(image); });
                }
            });
        }
        reconcile(hidden, blocked, HIDDEN);
        updateThumbnails(artwork);
        if (!style.isConnected && document.documentElement) {
            (document.head || document.documentElement).appendChild(style);
        }
    }

    function schedule() {
        if (!suspended && timer === null) {
            timer = setTimeout(apply, 80);
        }
    }

    var observer = new MutationObserver(function (changes) {
        if (changes.some(function (change) {
            return change.attributeName !== 'style' || thumbnails.has(change.target);
        })) {
            schedule();
        }
    });
    function observe() {
        observer.observe(document, {
            childList: true, subtree: true, characterData: true, attributes: true,
            attributeFilter: ['href', 'class', 'style', 'aria-label', 'tab-id', 'page-type',
                'data-is-auto-dubbed', 'data-members-only']
        });
    }

    window.__ssmusicPageElements = {
        update: function (value) {
            options = value;
            if (timer !== null) {
                clearTimeout(timer);
            }
            apply();
        },
        prune: function (value) {
            if (!options.autodubbed_videos || !Array.isArray(value.adaptiveFormats)) {
                return;
            }
            for (var index = value.adaptiveFormats.length - 1; index >= 0; index--) {
                var format = value.adaptiveFormats[index];
                if (format && format.audioTrack && format.audioTrack.isAutoDubbed === true) {
                    value.adaptiveFormats.splice(index, 1);
                }
            }
        }
    };
    window.addEventListener('pagehide', function () {
        suspended = true;
        observer.disconnect();
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    });
    window.addEventListener('pageshow', function () {
        suspended = false;
        observe();
        apply();
    });
    document.addEventListener('yt-navigate-finish', schedule);
    document.addEventListener('yt-page-data-updated', schedule);
    observe();
    apply();
})();
