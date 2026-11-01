package com.skystream.ssmusic;

enum PageElementBlock {
    SHORTS("shorts", R.id.block_youtube_shorts_switch, true),
    PLAYABLES("playables", R.id.block_youtube_playables_switch, true),
    RECOMMENDED("recommended_content", R.id.block_youtube_recommended_content_switch, false),
    DISTRACTIONS("distracting_elements", R.id.block_youtube_distracting_elements_switch, true),
    THUMBNAILS("thumbnails", R.id.block_youtube_thumbnails_switch, false),
    AUTO_DUBBED("autodubbed_videos", R.id.block_youtube_autodubbed_videos_switch, true),
    MEMBERS_ONLY("members_only_videos", R.id.block_youtube_members_only_videos_switch, true);

    final String scriptKey;
    final int switchId;
    final boolean defaultEnabled;

    PageElementBlock(String scriptKey, int switchId, boolean defaultEnabled) {
        this.scriptKey = scriptKey;
        this.switchId = switchId;
        this.defaultEnabled = defaultEnabled;
    }

    String preferenceKey() {
        return "block_youtube_" + scriptKey;
    }
}
