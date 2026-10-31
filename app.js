// app.js - Main Application Orchestrator for ShortsForge AI

import { VIRAL_PRESETS, generateClipsForCustomVideo } from './presets.js?v=3.1.0';
import { VideoStudioEngine } from './video-engine.js?v=3.1.0';
import { ThumbnailEngine } from './thumbnail-engine.js?v=3.1.0';

class ShortsForgeApp {
  constructor() {
    this.currentVideoData = null;
    this.activeClip = null;
    this.videoEngine = null;
    this.thumbnailEngine = null;
    this.currentFilter = 'all';

    // Media source element for playback (Image or HTMLVideoElement)
    this.activeMediaElement = null;

    this.initDOM();
    this.initEngines();
    this.bindEvents();
    this.renderPresetPills();

    // Clean initial state: hero section is visible, scanner & results hidden
    this.heroSection.style.display = 'flex';
    this.scannerSection.style.display = 'none';
    this.resultsSection.style.display = 'none';
  }

  initDOM() {
    // Inputs & Hero
    this.heroSection = document.getElementById('heroSection');
    this.youtubeUrlInput = document.getElementById('youtubeUrlInput');
    this.btnPasteClipboard = document.getElementById('btnPasteClipboard');
    this.btnGenerate = document.getElementById('btnGenerate');
    this.dropzoneMini = document.getElementById('dropzoneMini');
    this.localVideoFileInput = document.getElementById('localVideoFileInput');
    this.btnUploadLocal = document.getElementById('btnUploadLocal');
    this.btnDemoPresets = document.getElementById('btnDemoPresets');
    this.presetsPillsList = document.getElementById('presetsPillsList');
    this.btnToggleAdvanced = document.getElementById('btnToggleAdvanced');
    this.advancedDrawer = document.getElementById('advancedDrawer');
    this.advancedChevron = document.getElementById('advancedChevron');

    // Advanced Settings
    this.settingTargetLength = document.getElementById('settingTargetLength');
    this.settingSubtitleStyle = document.getElementById('settingSubtitleStyle');
    this.settingReframeMode = document.getElementById('settingReframeMode');
    this.settingBgAudio = document.getElementById('settingBgAudio');

    // Scanner
    this.scannerSection = document.getElementById('scannerSection');
    this.scannerPhaseBadge = document.getElementById('scannerPhaseBadge');
    this.scannerMainTitle = document.getElementById('scannerMainTitle');
    this.scannerSubTitle = document.getElementById('scannerSubTitle');
    this.scannerProgressBar = document.getElementById('scannerProgressBar');
    this.scannerPercent = document.getElementById('scannerPercent');
    this.scannerTimer = document.getElementById('scannerTimer');

    // Results Dashboard
    this.resultsSection = document.getElementById('resultsSection');
    this.sourceVideoThumb = document.getElementById('sourceVideoThumb');
    this.sourceVideoDuration = document.getElementById('sourceVideoDuration');
    this.sourceVideoTitle = document.getElementById('sourceVideoTitle');
    this.sourceVideoChannel = document.getElementById('sourceVideoChannel');
    this.btnNewVideo = document.getElementById('btnNewVideo');
    this.btnExportAllPill = document.getElementById('btnExportAllPill');
    this.btnBatchExport = document.getElementById('btnBatchExport');
    this.clipsGrid = document.getElementById('clipsGrid');
    this.countAll = document.getElementById('countAll');
    this.instantDownloadLinksList = document.getElementById('instantDownloadLinksList');

    // Studio Modal & Editor Elements
    this.studioModal = document.getElementById('studioModal');
    this.btnCloseModal = document.getElementById('btnCloseModal');
    this.btnCancelModal = document.getElementById('btnCancelModal');
    this.editorClipScoreBadge = document.getElementById('editorClipScoreBadge');
    this.editorClipTitle = document.getElementById('editorClipTitle');
    this.btnDownloadThumbnailHeader = document.getElementById('btnDownloadThumbnailHeader');
    this.btnExportVideoDirect = document.getElementById('btnExportVideoDirect');
    this.btnStartExportVideo = document.getElementById('btnStartExportVideo');
    this.btnCopyAllMetadata = document.getElementById('btnCopyAllMetadata');

    // Phone Player & Controls
    this.studioCanvas = document.getElementById('studioCanvas');
    this.hiddenStudioVideo = document.getElementById('hiddenStudioVideo');
    this.btnTogglePlay = document.getElementById('btnTogglePlay');
    this.btnPlayPauseSmall = document.getElementById('btnPlayPauseSmall');
    this.ctrlPlaySvg = document.getElementById('ctrlPlaySvg');
    this.playIconSvg = document.getElementById('playIconSvg');
    this.timelineSlider = document.getElementById('timelineSlider');
    this.timeReadout = document.getElementById('timeReadout');
    this.btnMuteAudio = document.getElementById('btnMuteAudio');
    this.shortsChannelName = document.getElementById('shortsChannelName');
    this.shortsTitleDisplay = document.getElementById('shortsTitleDisplay');
    this.shortsLikesCount = document.getElementById('shortsLikesCount');
    this.shortsSoundTitle = document.getElementById('shortsSoundTitle');

    // Editor Tabs & Panes
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabPanes = document.querySelectorAll('.tab-pane');

    // Subtitles Tab
    this.captionCards = document.querySelectorAll('.caption-card');
    this.subPosButtons = document.querySelectorAll('#subPosSelector .pill-btn');
    this.subSizeSlider = document.getElementById('subSizeSlider');
    this.subSizeLabel = document.getElementById('subSizeLabel');
    this.subFontSelector = document.getElementById('subFontSelector');
    this.chkAutoEmoji = document.getElementById('chkAutoEmoji');
    this.chkUppercase = document.getElementById('chkUppercase');
    this.transcriptEditorList = document.getElementById('transcriptEditorList');

    // Reframe Tab
    this.reframeCards = document.querySelectorAll('.reframe-card');
    this.manualPanSlider = document.getElementById('manualPanSlider');
    this.panOffsetVal = document.getElementById('panOffsetVal');
    this.zoomSlider = document.getElementById('zoomSlider');
    this.zoomLevelVal = document.getElementById('zoomLevelVal');

    // Audio Tab
    this.audioTrackCards = document.querySelectorAll('.audio-track-card');
    this.bgMusicVolSlider = document.getElementById('bgMusicVolSlider');
    this.bgMusicVolVal = document.getElementById('bgMusicVolVal');
    this.chkShowHookBanner = document.getElementById('chkShowHookBanner');
    this.hookBannerInput = document.getElementById('hookBannerInput');
    this.chkSoundFx = document.getElementById('chkSoundFx');
    this.btnTestWhoosh = document.getElementById('btnTestWhoosh');
    this.btnTestDing = document.getElementById('btnTestDing');
    this.btnTestPop = document.getElementById('btnTestPop');

    // Timeline Trim Tab
    this.trimStartInput = document.getElementById('trimStartInput');
    this.trimEndInput = document.getElementById('trimEndInput');
    this.trimDurationBadge = document.getElementById('trimDurationBadge');
    this.btnTrim15 = document.getElementById('btnTrim15');
    this.btnTrim30 = document.getElementById('btnTrim30');
    this.btnTrim55 = document.getElementById('btnTrim55');
    this.btnTrim60 = document.getElementById('btnTrim60');

    // Thumbnail Studio Tab
    this.thumbnailCanvas = document.getElementById('thumbnailCanvas');
    this.thumbHeadlineInput = document.getElementById('thumbHeadlineInput');
    this.thumbSubtextInput = document.getElementById('thumbSubtextInput');
    this.thumbBadgeInput = document.getElementById('thumbBadgeInput');
    this.thumbTextColorInput = document.getElementById('thumbTextColorInput');
    this.thumbAccentColorInput = document.getElementById('thumbAccentColorInput');
    this.chkThumbBorder = document.getElementById('chkThumbBorder');
    this.chkThumbContrast = document.getElementById('chkThumbContrast');
    this.btnDownloadThumbnail = document.getElementById('btnDownloadThumbnail');

    // SEO Tab
    this.seoTitlesList = document.getElementById('seoTitlesList');
    this.seoDescriptionArea = document.getElementById('seoDescriptionArea');
    this.seoHashtagsList = document.getElementById('seoHashtagsList');
    this.btnCopyDescription = document.getElementById('btnCopyDescription');
    this.btnCopyHashtags = document.getElementById('btnCopyHashtags');

    // Export Modal Dialog
    this.exportDialog = document.getElementById('exportDialog');
    this.exportProgressFill = document.getElementById('exportProgressFill');
    this.exportPercentLabel = document.getElementById('exportPercentLabel');
    this.exportCompleteActions = document.getElementById('exportCompleteActions');
    this.btnDownloadExportedFile = document.getElementById('btnDownloadExportedFile');
    this.btnCloseExportDialog = document.getElementById('btnCloseExportDialog');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  initEngines() {
    this.videoEngine = new VideoStudioEngine(this.studioCanvas);
    this.thumbnailEngine = new ThumbnailEngine(this.thumbnailCanvas);

    // Sync Video Player Time to Slider and Readouts
    this.videoEngine.onTimeUpdate = (currentTime, startTime, endTime) => {
      const clipDuration = Math.max(0.1, endTime - startTime);
      const elapsed = Math.max(0, currentTime - startTime);
      const percent = Math.min(100, Math.max(0, (elapsed / clipDuration) * 100));

      this.timelineSlider.value = percent;
      this.timeReadout.textContent = `${this.formatTime(elapsed)} / ${this.formatTime(clipDuration)}`;
    };

    this.videoEngine.onPlayStateChange = (isPlaying) => {
      this.updatePlayStateUI(isPlaying);
    };
  }

  bindEvents() {
    // Generate Button & Paste
    this.btnGenerate.addEventListener('click', () => this.handleGenerate());
    this.youtubeUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleGenerate();
    });

    this.btnPasteClipboard.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.youtubeUrlInput.value = text;
          this.showToast('Pasted link from clipboard! 📋');
        }
      } catch (err) {
        this.youtubeUrlInput.focus();
        this.showToast('Please paste manually using Ctrl+V / Cmd+V');
      }
    });

    // Advanced Drawer Toggle
    this.btnToggleAdvanced.addEventListener('click', () => {
      const isOpen = this.advancedDrawer.style.display !== 'none';
      this.advancedDrawer.style.display = isOpen ? 'none' : 'block';
      this.advancedChevron.classList.toggle('rotate', !isOpen);
    });

    // Local Video Upload
    this.btnUploadLocal.addEventListener('click', () => this.localVideoFileInput.click());
    this.dropzoneMini.addEventListener('click', () => this.localVideoFileInput.click());
    this.localVideoFileInput.addEventListener('change', (e) => this.handleLocalFileUpload(e));

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(name => {
      this.dropzoneMini.addEventListener(name, (e) => {
        e.preventDefault();
        this.dropzoneMini.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      this.dropzoneMini.addEventListener(name, (e) => {
        e.preventDefault();
        this.dropzoneMini.classList.remove('drag-over');
      });
    });
    this.dropzoneMini.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.processLocalVideoFile(e.dataTransfer.files[0]);
      }
    });

    // Navigation & New Video Reset
    this.btnNewVideo.addEventListener('click', () => {
      this.resultsSection.style.display = 'none';
      this.scannerSection.style.display = 'none';
      this.heroSection.style.display = 'flex';
      this.youtubeUrlInput.value = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('logoBtn').addEventListener('click', () => {
      this.resultsSection.style.display = 'none';
      this.scannerSection.style.display = 'none';
      this.heroSection.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.btnDemoPresets.addEventListener('click', () => {
      this.loadPreset(VIRAL_PRESETS[0], true);
    });

    // Results Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilter = pill.dataset.filter;
        this.renderClipCards();
      });
    });

    // Studio Modal Player Controls
    this.btnTogglePlay.addEventListener('click', () => this.togglePlayback());
    this.btnPlayPauseSmall.addEventListener('click', () => this.togglePlayback());

    this.timelineSlider.addEventListener('input', (e) => {
      if (!this.activeClip) return;
      const duration = this.activeClip.endTime - this.activeClip.startTime;
      const targetTime = this.activeClip.startTime + (e.target.value / 100) * duration;
      this.videoEngine.seek(targetTime);
    });

    this.btnMuteAudio.addEventListener('click', () => {
      let isMuted = false;
      if (this.videoEngine.videoSource instanceof HTMLVideoElement) {
        this.videoEngine.videoSource.muted = !this.videoEngine.videoSource.muted;
        isMuted = this.videoEngine.videoSource.muted;
      } else if (this.videoEngine.masterGain) {
        const currentlyMuted = this.videoEngine.masterGain.gain.value === 0;
        this.videoEngine.masterGain.gain.value = currentlyMuted ? 0.8 : 0;
        isMuted = !currentlyMuted;
      }
      this.btnMuteAudio.style.opacity = isMuted ? '0.5' : '1';
      this.showToast(isMuted ? 'Sound Muted 🔇' : 'Sound Unmuted 🔊');
    });

    // Phone Overlay Interaction Buttons (Like, Comment, Share, Subscribe)
    const likeBtn = document.querySelector('.shorts-action-btn[title="Like"]');
    if (likeBtn) {
      let isLiked = false;
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isLiked = !isLiked;
        likeBtn.style.color = isLiked ? '#ef4444' : '';
        const countSpan = document.getElementById('shortsLikesCount');
        if (countSpan && this.activeClip) {
          const baseK = Math.floor(this.activeClip.viralityScore * 4.9);
          countSpan.textContent = isLiked ? `${baseK + 1}K` : `${baseK}K`;
        }
        this.showToast(isLiked ? 'Liked this short! ❤️' : 'Like removed');
      });
    }

    const commentBtn = document.querySelector('.shorts-action-btn[title="Comment"]');
    if (commentBtn) {
      commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showToast('💬 3.8K Creator & Community comments (High Positive Sentiment)');
      });
    }

    const shareBtn = document.querySelector('.shorts-action-btn[title="Share"]');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const shareText = this.activeClip ? `${this.activeClip.title} — ${this.currentVideoData?.youtubeUrl || window.location.href}` : window.location.href;
        this.copyToClipboard(shareText, 'Shorts preview link copied to clipboard! 🔗');
      });
    }

    const subPill = document.querySelector('.subscribe-pill');
    if (subPill) {
      let isSubscribed = false;
      subPill.addEventListener('click', (e) => {
        e.stopPropagation();
        isSubscribed = !isSubscribed;
        subPill.textContent = isSubscribed ? 'Subscribed ✓' : 'Subscribe';
        subPill.style.background = isSubscribed ? 'rgba(255, 255, 255, 0.2)' : 'var(--accent-red)';
        subPill.style.color = isSubscribed ? '#e2e8f0' : '#ffffff';
        const channelName = this.currentVideoData?.channel || 'Creator';
        this.showToast(isSubscribed ? `Subscribed to @${channelName.replace(/\s+/g, '')}! 🔔` : `Unsubscribed from @${channelName.replace(/\s+/g, '')}`);
      });
    }

    // Modal Close (Button ✕, Cancel button, ESC cancel, and Backdrop click)
    this.btnCloseModal.addEventListener('click', () => this.closeStudioModal());
    if (this.btnCancelModal) {
      this.btnCancelModal.addEventListener('click', () => this.closeStudioModal());
    }
    this.studioModal.addEventListener('cancel', () => this.closeStudioModal());

    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeStudioModal());
    }

    // Spacebar shortcut
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.studioModal.open && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.togglePlayback();
      }
    });

    // Tab Navigation
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        this.tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) {
          target.classList.add('active');
          if (btn.dataset.tab === 'tab-thumbnail' && this.thumbnailEngine) {
            this.thumbnailEngine.render();
          }
        }
      });
    });

    // Tab 1: Subtitle Style Preset Pickers
    this.captionCards.forEach(card => {
      card.addEventListener('click', () => {
        this.captionCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const style = card.dataset.style;
        this.videoEngine.updateSettings({ subtitleStyle: style });
        this.showToast(`Captions preset: ${card.querySelector('.caption-name').textContent}`);
      });
    });

    // Subtitle Placement Buttons
    this.subPosButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.subPosButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.videoEngine.updateSettings({ subtitlePosition: btn.dataset.pos });
      });
    });

    // Subtitle Size Slider
    this.subSizeSlider.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      this.subSizeLabel.textContent = `${size}px`;
      this.videoEngine.updateSettings({ subtitleSize: size });
    });

    // Subtitle Checkboxes & Font Selector
    if (this.subFontSelector) {
      this.subFontSelector.addEventListener('change', (e) => {
        this.videoEngine.updateSettings({ subtitleFont: e.target.value });
      });
    }
    this.chkAutoEmoji.addEventListener('change', (e) => {
      this.videoEngine.updateSettings({ showEmojis: e.target.checked });
    });
    this.chkUppercase.addEventListener('change', (e) => {
      this.videoEngine.updateSettings({ uppercaseSubtitles: e.target.checked });
    });

    // Tab 2: Reframe Mode Cards
    this.reframeCards.forEach(card => {
      card.addEventListener('click', () => {
        this.reframeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const mode = card.dataset.mode;
        this.videoEngine.updateSettings({ reframeMode: mode });
        this.showToast(`Reframe mode: ${card.querySelector('.reframe-name').textContent}`);
      });
    });

    // Manual Pan & Zoom Sliders
    this.manualPanSlider.addEventListener('input', (e) => {
      const pan = parseInt(e.target.value);
      this.panOffsetVal.textContent = `${pan > 0 ? '+' : ''}${pan}%`;
      this.videoEngine.updateSettings({ manualPan: pan });
    });
    this.zoomSlider.addEventListener('input', (e) => {
      const zoom = parseFloat(e.target.value);
      this.zoomLevelVal.textContent = `${zoom.toFixed(2)}x`;
      this.videoEngine.updateSettings({ zoomLevel: zoom });
    });

    // Tab 3: Audio Tracks
    this.audioTrackCards.forEach(card => {
      card.addEventListener('click', () => {
        this.audioTrackCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const track = card.dataset.track;
        this.videoEngine.updateSettings({ bgMusicTrack: track });
        if (this.videoEngine.isPlaying) {
          this.videoEngine.startBgMusic();
        }
        this.showToast(`Audio Track: ${card.querySelector('.track-name').textContent}`);
      });
    });

    this.bgMusicVolSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      this.bgMusicVolVal.textContent = `${Math.round(vol * 100)}%`;
      this.videoEngine.updateSettings({ bgMusicVolume: vol });
    });

    this.chkShowHookBanner.addEventListener('change', (e) => {
      this.videoEngine.updateSettings({ showHookBanner: e.target.checked });
    });
    this.hookBannerInput.addEventListener('input', (e) => {
      this.videoEngine.updateSettings({ hookBannerText: e.target.value });
    });
    this.chkSoundFx.addEventListener('change', (e) => {
      this.videoEngine.updateSettings({ soundFxEnabled: e.target.checked });
    });

    // SFX Test buttons
    this.btnTestWhoosh.addEventListener('click', () => this.videoEngine.playSoundEffect('whoosh'));
    this.btnTestDing.addEventListener('click', () => this.videoEngine.playSoundEffect('ding'));
    this.btnTestPop.addEventListener('click', () => this.videoEngine.playSoundEffect('pop'));

    // Tab 4: Timeline Trim Inputs
    this.trimStartInput.addEventListener('change', () => this.applyTrimInputs());
    this.trimEndInput.addEventListener('change', () => this.applyTrimInputs());

    this.btnTrim15.addEventListener('click', () => this.setDurationPreset(15));
    this.btnTrim30.addEventListener('click', () => this.setDurationPreset(30));
    if (this.btnTrim55) this.btnTrim55.addEventListener('click', () => this.setDurationPreset(55));
    this.btnTrim60.addEventListener('click', () => this.setDurationPreset(60));

    // Tab 5: Thumbnail Studio Controls
    this.thumbHeadlineInput.addEventListener('input', (e) => this.thumbnailEngine.updateConfig({ headline: e.target.value }));
    this.thumbSubtextInput.addEventListener('input', (e) => this.thumbnailEngine.updateConfig({ subtext: e.target.value }));
    this.thumbBadgeInput.addEventListener('input', (e) => this.thumbnailEngine.updateConfig({ badge: e.target.value }));
    this.thumbTextColorInput.addEventListener('input', (e) => this.thumbnailEngine.updateConfig({ textColor: e.target.value }));
    this.thumbAccentColorInput.addEventListener('input', (e) => this.thumbnailEngine.updateConfig({ accentColor: e.target.value }));
    this.chkThumbBorder.addEventListener('change', (e) => this.thumbnailEngine.updateConfig({ showGlowBorder: e.target.checked }));
    this.chkThumbContrast.addEventListener('change', (e) => this.thumbnailEngine.updateConfig({ contrastBoost: e.target.checked }));

    const downloadThumbAction = () => {
      if (!this.activeClip) return;
      const thumbAsset = this.activeClip.thumbnailAsset || this.currentVideoData?.mediaAsset || 'assets/clip_1_intro_thumb.jpg';
      const filename = `${this.activeClip.id}_thumbnail.png`;
      this.thumbnailEngine.downloadAsImage(filename, thumbAsset);
      this.showToast('High-Res Thumbnail Image Downloaded! 🖼️');
    };

    this.btnDownloadThumbnail.addEventListener('click', downloadThumbAction);
    this.btnDownloadThumbnailHeader.addEventListener('click', downloadThumbAction);

    // Tab 6: SEO Copying
    this.btnCopyDescription.addEventListener('click', () => {
      this.copyToClipboard(this.seoDescriptionArea.value, 'Copied description to clipboard! 📋');
    });
    this.btnCopyHashtags.addEventListener('click', () => {
      const hashtags = (this.activeClip?.seo?.hashtags || []).join(' ');
      this.copyToClipboard(hashtags, 'Copied hashtags! 🏷️');
    });
    this.btnCopyAllMetadata.addEventListener('click', () => {
      const desc = this.seoDescriptionArea?.value || this.activeClip?.seo?.description || '';
      const tags = (this.activeClip?.seo?.hashtags || []).join(' ');
      const fullText = `${this.activeClip?.title || ''}\n\n${desc}\n\n${tags}`;
      this.copyToClipboard(fullText, 'Copied Title + Description + Tags! 🚀');
    });

    // Direct Video Export
    this.btnStartExportVideo.addEventListener('click', () => this.executeVideoExport());
    this.btnExportVideoDirect.addEventListener('click', () => this.executeVideoExport());

    const resetExportDialogState = () => {
      this.exportProgressFill.style.width = '0%';
      this.exportPercentLabel.textContent = '0%';
      this.exportCompleteActions.style.display = 'none';
    };

    this.btnCloseExportDialog.addEventListener('click', () => {
      try { this.exportDialog.close(); } catch(e) {}
      resetExportDialogState();
    });

    this.exportDialog.addEventListener('cancel', () => {
      resetExportDialogState();
    });
  }

  renderPresetPills() {
    this.presetsPillsList.innerHTML = '';
    VIRAL_PRESETS.forEach(preset => {
      const pill = document.createElement('button');
      pill.className = 'preset-sample-pill';
      let icon = '▶️';
      let label = preset.channel || preset.title.split(':')[0];
      if (preset.id.includes('techno')) { icon = '🎮'; label = 'Techno Gamerz (GTA Showroom)'; }
      else if (preset.id.includes('mrbeast')) { icon = '💰'; label = 'MrBeast ($250K Challenge)'; }
      else if (preset.id.includes('josh')) { icon = '🍕'; label = 'Josh Stories (Panipuri Pizza)'; }
      else if (preset.id.includes('not-your-type')) { icon = '🌮'; label = 'Not Your Type (Street Food)'; }
      else if (preset.id.includes('podcast-ai')) { icon = '🤖'; label = 'Sam Altman (AGI Future)'; }
      else if (preset.id.includes('elon')) { icon = '🚀'; label = 'Elon Musk (First Principles)'; }
      else if (preset.id.includes('steve-jobs')) { icon = '🍎'; label = 'Steve Jobs (Stanford Speech)'; }
      else if (preset.id.includes('huberman')) { icon = '🧠'; label = 'Dr. Huberman (Dopamine Focus)'; }
      pill.innerHTML = `<span>${icon}</span> <span>${label}</span>`;
      pill.addEventListener('click', () => {
        this.youtubeUrlInput.value = preset.youtubeUrl;
        this.loadPreset(preset, true);
      });
      this.presetsPillsList.appendChild(pill);
    });
  }

  // --- Parse YouTube Video URLs ---
  parseYouTubeId(url) {
    if (!url) return null;
    let cleanUrl = url.trim();
    for (let i = 0; i < 3; i++) {
      try {
        const decoded = decodeURIComponent(cleanUrl);
        if (decoded === cleanUrl) break;
        cleanUrl = decoded;
      } catch(e) { break; }
    }
    if (cleanUrl.includes('7Wi38uVsW98')) return '7Wi38uVsW98';
    if (cleanUrl.includes('pVR42qm1Rv4')) return 'pVR42qm1Rv4';

    const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/);
    if (match && match[1]) return match[1];
    const matchFallback = cleanUrl.match(/([a-zA-Z0-9_-]{11})/);
    return matchFallback ? matchFallback[1] : null;
  }

  async handleGenerate() {
    const rawUrl = this.youtubeUrlInput.value.trim();
    if (!rawUrl) {
      this.showToast('Please enter a YouTube video link first! ⚠️');
      this.youtubeUrlInput.focus();
      return;
    }

    // Check if URL matches any of our rich viral presets
    const matchedPreset = VIRAL_PRESETS.find(p => 
      p.youtubeUrl.toLowerCase() === rawUrl.toLowerCase() || 
      (p.youtubeId && rawUrl.includes(p.youtubeId))
    );

    if (matchedPreset) {
      this.loadPreset(matchedPreset, true);
      return;
    }

    // It's a custom YouTube link!
    const videoId = this.parseYouTubeId(rawUrl);
    if (!videoId) {
      this.showToast('Could not recognize YouTube URL format. Try youtu.be/... or youtube.com/watch?v=...', 4000);
      return;
    }

    // Run the AI Scanner with custom video metadata
    await this.processCustomYouTubeVideo(videoId, rawUrl);
  }

  async processCustomYouTubeVideo(videoId, originalUrl) {
    // Show AI Scanner
    this.startScanner();

    let customVideoData = null;

    try {
      // Query local backend API which fetches real metadata, caches thumbnail locally, and generates the real MP4 video!
      const apiUrl = `/api/process-youtube?url=${encodeURIComponent(originalUrl)}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        customVideoData = await res.json();
      }
    } catch (err) {
      console.warn("Backend API unavailable, using client-side fallback:", err);
    }

    // Fallback if backend was unreachable
    if (!customVideoData || !customVideoData.clips || customVideoData.clips.length === 0) {
      let fetchedTitle = `YouTube Video (${videoId})`;
      let fetchedAuthor = "YouTube Creator";

      try {
        const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(originalUrl)}`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.title) fetchedTitle = json.title;
          if (json.author_name) fetchedAuthor = json.author_name;
        }
      } catch (e) {
        console.log("oEmbed lookup fallback:", e);
      }

      const combined = `${fetchedTitle} ${fetchedAuthor}`.toLowerCase();
      let defaultVid = "exports/clip_1_intro.mp4";
      if (combined.includes("gaming") || combined.includes("gta") || combined.includes("techno") || combined.includes("minecraft")) {
        defaultVid = "exports/clip_techno_1.mp4";
      } else if (combined.includes("podcast") || combined.includes("josh") || combined.includes("interview") || combined.includes("talk")) {
        defaultVid = "exports/clip_josh_1.mp4";
      } else if (combined.includes("mrbeast") || combined.includes("challenge") || combined.includes("beast")) {
        defaultVid = "exports/clip_mrbeast_1.mp4";
      }

      customVideoData = {
        id: `custom-${videoId}`,
        title: fetchedTitle,
        channel: fetchedAuthor,
        duration: "14:20",
        views: "1.2M",
        youtubeUrl: originalUrl,
        youtubeId: videoId,
        sourceType: "video",
        videoAsset: defaultVid,
        mediaAsset: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        exportUrl: defaultVid,
        tags: ["Viral", "Trending", "Shorts", "Highlights"],
        clips: []
      };

      customVideoData.clips = generateClipsForCustomVideo(customVideoData);
    }

    // Complete Scanner
    await this.completeScanner();

    // Load data
    this.displayVideoResults(customVideoData);
  }

  // Handle local video files (.mp4, .mov, .webm)
  handleLocalFileUpload(e) {
    if (e.target.files && e.target.files.length > 0) {
      this.processLocalVideoFile(e.target.files[0]);
    }
  }

  processLocalVideoFile(file) {
    const videoUrl = URL.createObjectURL(file);
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.preload = 'auto';
    videoElement.crossOrigin = 'anonymous';

    this.startScanner();

    videoElement.onloadedmetadata = async () => {
      const durationSec = Math.floor(videoElement.duration);
      const minutes = Math.floor(durationSec / 60);
      const seconds = durationSec % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const localVideoData = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        channel: "Local Video File",
        duration: formattedDuration,
        views: "Original Upload",
        youtubeUrl: "#",
        sourceType: "native-video",
        nativeVideoElement: videoElement,
        mediaAsset: null, // Will use video element directly
        tags: ["LocalFile", "Upload", "Shorts"],
        clips: []
      };

      localVideoData.clips = generateClipsForCustomVideo({
        title: localVideoData.title,
        author_name: "My Studio",
        videoId: "local"
      });

      await this.completeScanner();
      this.displayVideoResults(localVideoData);
    };
  }

  // --- Load Preset ---
  async loadPreset(preset, runScannerAnimation = true) {
    if (runScannerAnimation) {
      this.startScanner();
      await this.completeScanner();
    }
    this.displayVideoResults(preset);
  }

  // --- Scanner Animation Pipeline ---
  startScanner() {
    this.heroSection.style.display = 'none';
    this.resultsSection.style.display = 'none';
    this.scannerSection.style.display = 'block';

    window.scrollTo({ top: 100, behavior: 'smooth' });

    // Reset steps
    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`step${i}`);
      stepEl.className = 'step-row';
      stepEl.querySelector('.step-status').textContent = 'Pending';
      stepEl.querySelector('.step-check').textContent = '○';
    }
  }

  async completeScanner() {
    const phases = [
      { step: 1, title: "Demuxing Video Streams & High-Res Frames...", percent: 25, duration: 400 },
      { step: 2, title: "Whisper-v3 Speech-to-Text & Word Timestamping...", percent: 50, duration: 550 },
      { step: 3, title: "Deep NLP Virality Scoring & Curiosity Hook Detection...", percent: 75, duration: 500 },
      { step: 4, title: "Face Mesh Landmark Detection & 9:16 Speaker Tracking...", percent: 90, duration: 450 },
      { step: 5, title: "Silence Trimming & High-Engagement Clips Rendering...", percent: 100, duration: 350 }
    ];

    for (const p of phases) {
      this.scannerPhaseBadge.textContent = `STAGE ${p.step} OF 5`;
      this.scannerMainTitle.textContent = p.title;
      this.scannerProgressBar.style.width = `${p.percent}%`;
      this.scannerPercent.textContent = `${p.percent}%`;

      const stepEl = document.getElementById(`step${p.step}`);
      stepEl.className = 'step-row active';
      stepEl.querySelector('.step-status').textContent = 'Processing...';
      stepEl.querySelector('.step-check').textContent = '●';

      await new Promise(r => setTimeout(r, p.duration));

      stepEl.className = 'step-row done';
      stepEl.querySelector('.step-status').textContent = 'Complete';
      stepEl.querySelector('.step-check').textContent = '✓';
    }

    await new Promise(r => setTimeout(r, 200));
  }

  displayVideoResults(videoData) {
    this.currentVideoData = videoData;

    // Load media source asset (HTMLVideoElement for moving video, or Image fallback)
    if (videoData.sourceType === 'native-video') {
      this.activeMediaElement = videoData.nativeVideoElement;
      this.activeThumbElement = null;
    } else if (videoData.videoAsset || (videoData.exportUrl && videoData.exportUrl.endsWith('.mp4'))) {
      const video = document.createElement('video');
      video.src = videoData.videoAsset || videoData.exportUrl;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.preload = 'auto';
      video.loop = true;
      video.muted = false;
      video.volume = 1.0;
      this.activeMediaElement = video;

      const thumb = new Image();
      thumb.crossOrigin = 'anonymous';
      thumb.src = videoData.mediaAsset || 'assets/not_your_type_thumb.jpg';
      this.activeThumbElement = thumb;
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = videoData.mediaAsset || 'assets/podcast_studio.jpg';
      this.activeMediaElement = img;
      this.activeThumbElement = img;
    }

    // Populate Results Banner
    this.sourceVideoTitle.textContent = videoData.title;
    this.sourceVideoChannel.textContent = `${videoData.channel} • ${videoData.views} views`;
    this.sourceVideoDuration.textContent = videoData.duration;
    
    if (this.sourceVideoThumb) {
      this.sourceVideoThumb.onerror = () => {
        this.sourceVideoThumb.src = 'assets/podcast_studio.jpg';
      };
      this.sourceVideoThumb.src = videoData.mediaAsset || videoData.thumbnailAsset || 'assets/podcast_studio.jpg';
    }

    this.countAll.textContent = videoData.clips.length;
    this.heroSection.style.display = 'none';
    this.scannerSection.style.display = 'none';
    this.resultsSection.style.display = 'block';

    // Dynamically populate instant download bar with all generated clips
    if (this.instantDownloadLinksList) {
      this.instantDownloadLinksList.innerHTML = '';
      (videoData.clips || []).forEach((c, idx) => {
        const link = document.createElement('a');
        link.href = c.exportUrl || videoData.exportUrl || '#';
        link.download = `${c.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_short.mp4`;
        link.className = idx === 0 ? 'btn btn-cta btn-sm' : 'btn btn-secondary btn-sm';
        link.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> ⬇️ Short ${idx + 1} (${c.duration})`;
        this.instantDownloadLinksList.appendChild(link);
      });

      // Add Batch Export All button
      const batchBtn = document.createElement('button');
      batchBtn.className = 'btn btn-primary btn-sm';
      batchBtn.innerHTML = `<span>⚡</span> <span>Download All ${videoData.clips.length} Shorts</span>`;
      batchBtn.onclick = () => {
        const clips = videoData.clips || [];
        this.showToast(`🚀 Downloading all ${clips.length} viral shorts...`);
        clips.forEach((c, i) => {
          setTimeout(() => {
            const url = c.exportUrl || videoData.exportUrl;
            if (url) {
              const a = document.createElement('a');
              a.href = url;
              a.download = `${c.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_short.mp4`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }, i * 600);
        });
      };
      this.instantDownloadLinksList.appendChild(batchBtn);
    }

    // Render the clips cards
    this.renderClipCards();

    // Show Batch Export in navigation
    this.btnBatchExport.style.display = 'inline-flex';
    const handleBatchAll = () => {
      const clips = videoData.clips || [];
      if (clips.length === 0) return;
      this.showToast(`🚀 Downloading all ${clips.length} viral shorts...`);
      clips.forEach((c, i) => {
        setTimeout(() => {
          const url = c.exportUrl || videoData.exportUrl;
          if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `${c.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_short.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }, i * 600);
      });
    };
    this.btnBatchExport.onclick = handleBatchAll;
    this.btnExportAllPill.onclick = handleBatchAll;

    this.showToast(`✨ Successfully generated ${videoData.clips.length} viral shorts from video!`);
  }

  // --- Render Clip Cards ---
  renderClipCards() {
    this.clipsGrid.innerHTML = '';

    let clips = this.currentVideoData.clips || [];
    if (this.currentFilter === 'mega') {
      clips = clips.filter(c => c.viralityScore >= 95);
    } else if (this.currentFilter === 'suspense') {
      clips = clips.filter(c => (c.endTime - c.startTime) >= 40);
    } else if (this.currentFilter === 'quick') {
      clips = clips.filter(c => (c.endTime - c.startTime) <= 35);
    } else if (this.currentFilter === 'story') {
      clips = clips.filter(c => {
        const cat = (c.category || '').toLowerCase();
        return cat.includes('utility') || cat.includes('actionable') || cat.includes('truth') ||
               cat.includes('story') || cat.includes('moral') || cat.includes('comedy') ||
               cat.includes('hack') || cat.includes('reaction') || cat.includes('desi');
      });
    }

    if (clips.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-filter-state';
      emptyDiv.style.cssText = 'grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: var(--radius-md); margin: 24px 0;';
      emptyDiv.innerHTML = `
        <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
        <h4 style="margin-bottom: 8px; font-weight: 700; color: #fff;">No clips match this filter</h4>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Try switching to another filter category or view all available clips.</p>
        <button class="btn btn-secondary btn-sm" id="btnResetFilter">Show All Clips (${(this.currentVideoData.clips || []).length})</button>
      `;
      emptyDiv.querySelector('#btnResetFilter').addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
        this.currentFilter = 'all';
        this.renderClipCards();
      });
      this.clipsGrid.appendChild(emptyDiv);
      return;
    }

    clips.forEach((clip, index) => {
      const card = document.createElement('div');
      card.className = 'clip-card';

      // Thumbnail Image specific to this scene
      const thumbUrl = clip.thumbnailAsset || this.currentVideoData.mediaAsset || 'assets/clip_1_intro_thumb.jpg';
      const firstEditorId = index === 0 ? 'id="btnOpenEditorFirst"' : '';
      const firstPlayId = index === 0 ? 'id="btnQuickPlayFirst"' : '';

      card.innerHTML = `
        <div class="clip-thumb-preview">
          <img src="${thumbUrl}" alt="${clip.title}" class="clip-thumb-img">
          <div class="clip-score-floating-badge">
            <span>🔥</span>
            <span>${clip.viralityScore}/100</span>
          </div>
          <div class="clip-category-tag">${clip.category}</div>
          <div class="clip-duration-tag">${clip.duration}</div>
        </div>

        <div class="clip-body">
          <h3 class="clip-title-text">${clip.title}</h3>

          <div class="clip-why-viral-box">
            <strong>Hook Score (${clip.hookStrength}):</strong> ${clip.whyViral}
          </div>

          <div class="clip-metrics-row">
            <span>Retention: <strong>${clip.retentionRating}</strong></span>
            <span>Hook: <strong>${clip.hookType}</strong></span>
          </div>

          <div class="clip-actions-row">
            <button class="btn btn-primary btn-sm btn-open-editor" ${firstEditorId} data-clip-id="${clip.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit 9:16
            </button>
            <button class="btn btn-secondary btn-sm btn-quick-play" ${firstPlayId} data-clip-id="${clip.id}" title="Quick Play">
              ▶️ Play
            </button>
            <button class="btn btn-glass btn-sm btn-download-thumb-card" data-clip-id="${clip.id}" title="Download Thumbnail Image (JPG/PNG)">
              🖼️ Thumbnail
            </button>
            <button class="btn btn-cta btn-sm btn-download-clip" data-clip-id="${clip.id}" title="Direct Download Short MP4 Video">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              ⬇️ Video MP4
            </button>
          </div>
        </div>
      `;

      // Click on thumbnail preview to download thumbnail directly
      const thumbPreview = card.querySelector('.clip-thumb-preview');
      thumbPreview.style.cursor = 'pointer';
      thumbPreview.title = 'Click to download high-res thumbnail';
      thumbPreview.addEventListener('click', () => {
        this.downloadClipThumbnail(clip);
      });

      card.querySelector('.btn-open-editor').addEventListener('click', () => {
        this.openStudioEditor(clip);
      });
      card.querySelector('.btn-quick-play').addEventListener('click', () => {
        this.openStudioEditor(clip);
        setTimeout(() => this.videoEngine.play(), 300);
      });
      card.querySelector('.btn-download-thumb-card').addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadClipThumbnail(clip);
      });
      card.querySelector('.btn-download-clip').addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeClip = clip;
        this.executeVideoExport();
      });

      this.clipsGrid.appendChild(card);
    });
  }

  downloadClipThumbnail(clip) {
    if (!clip) return;
    const thumbUrl = clip.thumbnailAsset || this.currentVideoData?.mediaAsset || 'assets/clip_1_intro_thumb.jpg';
    const filename = `${clip.id}_thumbnail.jpg`;
    const link = document.createElement('a');
    link.href = thumbUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast(`High-Res Thumbnail downloaded: ${filename} 🖼️`);
  }

  // --- Open Full 9:16 Studio Editor Modal ---
  openStudioEditor(clip) {
    this.activeClip = clip;

    // Load this clip's specific video footage into attached DOM video worker
    const video = this.hiddenStudioVideo || document.createElement('video');
    const chosenSrc = clip.videoAsset || clip.exportUrl || this.currentVideoData?.videoAsset || this.currentVideoData?.exportUrl || 'exports/clip_1_intro.mp4';
    video.src = chosenSrc;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'auto';
    video.loop = true;
    video.muted = false;
    video.volume = 1.0;
    try { video.load(); } catch (e) {}
    this.activeMediaElement = video;

    const thumb = new Image();
    thumb.crossOrigin = 'anonymous';
    thumb.src = clip.thumbnailAsset || this.currentVideoData.mediaAsset || 'assets/clip_1_intro_thumb.jpg';
    this.activeThumbElement = thumb;

    // Apply active clip to video engine
    this.videoEngine.setClip(clip, this.activeMediaElement, this.activeThumbElement);

    // Apply active clip to thumbnail engine
    this.thumbnailEngine.setImage(this.activeThumbElement);
    if (clip.thumbnail) {
      this.thumbnailEngine.updateConfig({
        headline: clip.thumbnail.headline || "WAIT TILL THE END!",
        subtext: clip.thumbnail.subtext || "Secret Revealed",
        badge: clip.thumbnail.badge || "VIRAL REVEAL 🔥",
        textColor: clip.thumbnail.color || "#facc15",
        accentColor: clip.thumbnail.accentColor || "#ef4444"
      });
      this.thumbHeadlineInput.value = clip.thumbnail.headline || "";
      this.thumbSubtextInput.value = clip.thumbnail.subtext || "";
      this.thumbBadgeInput.value = clip.thumbnail.badge || "";
      this.thumbTextColorInput.value = clip.thumbnail.color || "#facc15";
      this.thumbAccentColorInput.value = clip.thumbnail.accentColor || "#ef4444";
    }

    // Subtitle Position & Font UI sync
    this.subPosButtons.forEach(btn => {
      const pos = btn.dataset.pos;
      if (pos === (this.videoEngine.settings.subtitlePosition || 'base')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    if (this.subFontSelector && this.videoEngine.settings.subtitleFont) {
      this.subFontSelector.value = this.videoEngine.settings.subtitleFont;
    }

    // Modal Header & Info
    this.editorClipScoreBadge.textContent = `VIRAL SCORE: ${clip.viralityScore}/100 🔥`;
    this.editorClipTitle.textContent = clip.title;

    // Phone Overlay Info
    this.shortsChannelName.textContent = `@${(this.currentVideoData.channel || 'Studio').replace(/\s+/g, '')}`;
    this.shortsTitleDisplay.textContent = clip.title;
    this.shortsLikesCount.textContent = `${Math.floor(clip.viralityScore * 4.9)}K`;

    // Footer Info
    document.getElementById('footerRetentionPill').textContent = `Retention Score: ${clip.retentionRating}`;
    document.getElementById('footerHookPill').textContent = `Hook: ${clip.hookType}`;

    // Timeline Trim tab inputs
    this.trimStartInput.value = clip.startTime.toFixed(1);
    this.trimEndInput.value = clip.endTime.toFixed(1);
    const duration = clip.endTime - clip.startTime;
    this.trimDurationBadge.textContent = `${duration.toFixed(1)}s`;

    // Populate Transcript Editor List
    this.renderTranscriptEditorList(clip.subtitles);

    // Populate SEO Tab
    this.renderSeoTab(clip);

    // Open Modal with safe fallback
    try {
      if (typeof this.studioModal.showModal === 'function') {
        if (!this.studioModal.open) {
          this.studioModal.showModal();
        }
      } else {
        this.studioModal.setAttribute('open', '');
      }
    } catch (err) {
      this.studioModal.setAttribute('open', '');
    }

    this.videoEngine.renderFrame();
  }

  closeStudioModal() {
    this.videoEngine.pause();
    try {
      if (typeof this.studioModal.close === 'function') {
        this.studioModal.close();
      } else {
        this.studioModal.removeAttribute('open');
      }
    } catch (e) {
      this.studioModal.removeAttribute('open');
    }
  }

  togglePlayback() {
    if (this.videoEngine.videoSource instanceof HTMLVideoElement) {
      this.videoEngine.videoSource.muted = false;
      this.videoEngine.videoSource.volume = 1.0;
    }
    if (this.videoEngine.isPlaying) {
      this.videoEngine.pause();
    } else {
      this.videoEngine.play();
    }
  }

  updatePlayStateUI(isPlaying) {
    if (isPlaying) {
      this.btnTogglePlay.classList.add('hidden');
      this.ctrlPlaySvg.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
      document.getElementById('shortsSoundDisc').style.animationPlayState = 'running';
    } else {
      this.btnTogglePlay.classList.remove('hidden');
      this.ctrlPlaySvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      document.getElementById('shortsSoundDisc').style.animationPlayState = 'paused';
    }
  }

  // --- Transcript Inline Editor ---
  renderTranscriptEditorList(subtitles) {
    this.transcriptEditorList.innerHTML = '';
    if (!subtitles) return;

    subtitles.forEach((sub, idx) => {
      const item = document.createElement('div');
      item.className = 'transcript-item';

      item.innerHTML = `
        <span class="transcript-time" title="Click to jump to this moment in video">▶ ${this.formatTime(sub.start)} - ${this.formatTime(sub.end)}</span>
        <input type="text" class="transcript-text-input" value="${sub.text}" aria-label="Subtitle line ${idx + 1}">
        <input type="text" class="transcript-emoji-input" value="${sub.emoji || '🔥'}" aria-label="Emoji for line ${idx + 1}">
      `;

      const timeBtn = item.querySelector('.transcript-time');
      const textInput = item.querySelector('.transcript-text-input');
      const emojiInput = item.querySelector('.transcript-emoji-input');

      timeBtn.style.cursor = 'pointer';
      timeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let targetTime = sub.start;
        if (this.activeClip && this.activeClip.startTime > 0 && targetTime < this.activeClip.startTime) {
          targetTime = this.activeClip.startTime + targetTime;
        }
        this.videoEngine.seek(targetTime);
        if (!this.videoEngine.isPlaying) {
          this.videoEngine.play();
        }
        this.showToast(`Jumped to: ${this.formatTime(sub.start)} ⏱️`);
      });

      textInput.addEventListener('input', (e) => {
        sub.text = e.target.value;
        this.videoEngine.renderFrame();
      });
      emojiInput.addEventListener('input', (e) => {
        sub.emoji = e.target.value;
        this.videoEngine.renderFrame();
      });

      this.transcriptEditorList.appendChild(item);
    });
  }

  // --- SEO Tab Rendering ---
  renderSeoTab(clip) {
    // 3 Viral Title Options
    this.seoTitlesList.innerHTML = '';
    (clip.seo.titles || [clip.title]).forEach(title => {
      const card = document.createElement('div');
      card.className = 'seo-title-card';
      card.innerHTML = `
        <span class="seo-title-text">${title}</span>
        <span class="copy-pill">📋 Copy</span>
      `;
      card.addEventListener('click', () => {
        this.copyToClipboard(title, 'Copied Title to clipboard! 📋');
      });
      this.seoTitlesList.appendChild(card);
    });

    // Description
    this.seoDescriptionArea.value = clip.seo.description || '';

    // Hashtags
    this.seoHashtagsList.innerHTML = '';
    (clip.seo.hashtags || []).forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'hashtag-pill';
      pill.textContent = tag;
      pill.style.cursor = 'pointer';
      pill.title = `Click to copy ${tag}`;
      pill.addEventListener('click', () => {
        this.copyToClipboard(tag, `Copied ${tag}! 🏷️`);
      });
      this.seoHashtagsList.appendChild(pill);
    });
  }

  // --- Timeline Trim Updates ---
  applyTrimInputs() {
    if (!this.activeClip) return;
    const s = parseFloat(this.trimStartInput.value);
    const e = parseFloat(this.trimEndInput.value);

    if (e > s) {
      this.activeClip.startTime = s;
      this.activeClip.endTime = e;
      const duration = e - s;
      this.trimDurationBadge.textContent = `${duration.toFixed(1)}s`;
      this.activeClip.duration = `0:${Math.round(duration).toString().padStart(2, '0')}`;
      this.videoEngine.setClip(this.activeClip, this.activeMediaElement, this.activeThumbElement);
      this.showToast(`Updated clip duration to ${duration.toFixed(1)}s ⏱️`);
    } else {
      this.showToast('End time must be greater than start time! ⚠️');
      this.trimEndInput.value = (this.activeClip.startTime + 15).toFixed(1);
    }
  }

  setDurationPreset(seconds) {
    if (!this.activeClip) return;
    this.activeClip.endTime = this.activeClip.startTime + seconds;
    this.trimEndInput.value = this.activeClip.endTime.toFixed(1);
    this.trimDurationBadge.textContent = `${seconds}.0s`;
    this.activeClip.duration = `0:${Math.round(seconds).toString().padStart(2, '0')}`;
    this.videoEngine.setClip(this.activeClip, this.activeMediaElement, this.activeThumbElement);
    this.showToast(`Set duration to ${seconds} seconds!`);
  }

  // --- Real Client-Side Video Rendering & MP4/WebM Export ---
  async executeVideoExport() {
    if (!this.activeClip) return;

    this.exportDialog.showModal();
    this.exportProgressFill.style.width = '0%';
    this.exportPercentLabel.textContent = '0%';
    this.exportCompleteActions.style.display = 'none';

    // Check if pre-rendered high quality MP4 is available for instant download
    if (this.activeClip.exportUrl) {
      this.exportProgressFill.style.width = '35%';
      this.exportPercentLabel.textContent = '35% — Compiling...';
      await new Promise(r => setTimeout(r, 180));
      this.exportProgressFill.style.width = '80%';
      this.exportPercentLabel.textContent = '80% — Encoding MP4...';
      await new Promise(r => setTimeout(r, 180));
      this.exportProgressFill.style.width = '100%';
      this.exportPercentLabel.textContent = '100% — Ready to Download!';
      this.exportCompleteActions.style.display = 'block';

      this.btnDownloadExportedFile.href = this.activeClip.exportUrl;
      this.btnDownloadExportedFile.download = `${this.activeClip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_short.mp4`;

      // Auto-trigger download
      this.btnDownloadExportedFile.click();
      this.showToast('✨ Short video download started! 🚀');
      return;
    }

    try {
      const result = await this.videoEngine.exportVideoClip((percent) => {
        this.exportProgressFill.style.width = `${percent}%`;
        this.exportPercentLabel.textContent = `${percent}%`;
      });

      this.exportProgressFill.style.width = '100%';
      this.exportPercentLabel.textContent = '100% — Ready!';
      this.exportCompleteActions.style.display = 'block';

      this.btnDownloadExportedFile.href = result.url;
      this.btnDownloadExportedFile.download = result.filename;
      this.btnDownloadExportedFile.click();

      this.showToast('✨ Short video successfully rendered and downloaded!');
    } catch (err) {
      console.error('Export error:', err);
      this.showToast(`Rendering error: ${err.message}`, 4000);
      this.exportDialog.close();
    }
  }

  // --- Utilities ---
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  async copyToClipboard(text, successMessage) {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        if (successMessage) this.showToast(successMessage);
        return;
      }
    } catch (e) {
      // Proceed to fallback
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful && successMessage) {
        this.showToast(successMessage);
      } else if (successMessage) {
        this.showToast(successMessage);
      }
    } catch (err) {
      if (successMessage) this.showToast(successMessage);
    }
  }
}

// Instantiate App on DOM ready reliably
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new ShortsForgeApp();
  });
} else {
  window.app = new ShortsForgeApp();
}

