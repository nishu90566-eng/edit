// video-engine.js - Canvas 9:16 Video Rendering, Dynamic Subtitles, Audio Synth & MediaRecorder Export

export class VideoStudioEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Virtual 9:16 Shorts dimensions (High-Definition 1080x1920)
    this.width = 1080;
    this.height = 1920;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // State
    this.isPlaying = false;
    this.currentTime = 0;
    this.clip = null;
    this.videoSource = null; // Can be an Image or HTMLVideoElement
    this.splitAsset = null;  // For split screen bottom asset
    this.animFrameId = null;
    this.lastTimestamp = 0;

    // Customization Settings
    this.settings = {
      subtitleStyle: 'hormozi', // 'hormozi', 'mrbeast', 'cyberpunk', 'minimal', 'redalert'
      subtitleSize: 48,
      subtitlePosition: 'base', // 'top', 'middle', 'base' (or 'bottom')
      subtitleFont: '"Arial Rounded MT Bold", "Outfit", "Arial Black", sans-serif',
      showEmojis: true,
      uppercaseSubtitles: true,
      reframeMode: 'speaker-center', // 'speaker-center', 'speaker-left', 'speaker-right', 'split-screen', 'blur-sides'
      manualPan: 0, // -50 to +50
      zoomLevel: 1.0, // 1.0 to 2.0
      hookBannerText: 'Wait till the end... 🤯',
      showHookBanner: true,
      showProgressBar: true,
      bgMusicTrack: 'lofi', // 'lofi', 'phonk', 'suspense', 'upbeat', 'none'
      bgMusicVolume: 0.35,
      soundFxEnabled: true
    };

    // Callbacks
    this.onTimeUpdate = null;
    this.onPlayStateChange = null;

    // Web Audio Synthesizer
    this.initAudio();

    // Load default split asset (satisfying neon tunnel)
    this.loadSplitAsset('assets/satisfying_neon.jpg');
  }

  initAudio() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.audioDest = this.audioCtx.createMediaStreamDestination();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.audioCtx.destination);
        this.masterGain.connect(this.audioDest);
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.gain.value = this.settings.bgMusicVolume;
        this.musicGain.connect(this.masterGain);
      }
    } catch (err) {
      console.warn("Web Audio initialization skipped:", err);
    }
  }

  loadSplitAsset(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.splitAsset = img;
      if (!this.isPlaying) this.renderFrame();
    };
  }

  speakSubtitle(text) {
    if (!('speechSynthesis' in window)) return;
    if (this.lastSpokenText === text) return;
    this.lastSpokenText = text;
    try {
      window.speechSynthesis.cancel();
      // Clean emoji or non-speech characters
      const clean = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      if (!clean) return;
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.15;
      utterance.pitch = 1.05;
      utterance.volume = 0.95;
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find(v => v.lang.startsWith('en') || v.lang.startsWith('hi')) || voices[0];
        if (preferred) utterance.voice = preferred;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Speech synthesis unsupported or blocked
    }
  }

  setClip(clip, videoSourceElement, fallbackThumb = null) {
    this.clip = clip;
    this.videoSource = videoSourceElement;
    this.fallbackThumb = fallbackThumb;
    this.currentTime = clip.startTime;
    this.lastSpokenText = '';
    
    // Apply clip specific defaults if provided
    if (clip.reframeMode) {
      this.settings.reframeMode = clip.reframeMode;
    }
    if (clip.speakerPan !== undefined) {
      this.settings.manualPan = clip.speakerPan;
    }
    if (clip.title) {
      this.settings.hookBannerText = clip.thumbnail?.badge || "MUST WATCH ⚠️";
    }

    if (this.videoSource instanceof HTMLVideoElement) {
      this.videoSource.currentTime = this.currentTime;
      this.videoSource.muted = false;
      this.videoSource.volume = 1.0;

      const onReady = () => {
        if (!this.isPlaying) this.renderFrame();
      };
      if (this.videoSource.readyState >= 2) {
        onReady();
      } else {
        this.videoSource.onloadeddata = onReady;
        this.videoSource.oncanplay = onReady;
      }
      this.videoSource.onseeked = () => {
        if (!this.isPlaying) this.renderFrame();
      };
      this.videoSource.onerror = (err) => {
        console.warn("[VideoEngine] Video load error, using fallback thumbnail:", err);
        if (this.fallbackThumb) {
          this.renderFrame();
        }
      };
    }

    this.renderFrame();
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime, this.clip.startTime, this.clip.endTime);
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.bgMusicVolume;
    }
    if (!this.isPlaying) {
      this.renderFrame();
    }
  }

  play() {
    if (this.isPlaying) return;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.startBgMusic();

    if (this.videoSource instanceof HTMLVideoElement) {
      this.videoSource.currentTime = this.currentTime;
      this.videoSource.muted = false;
      const playPromise = this.videoSource.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name === 'AbortError') return; // Pause interrupted play request, expected
          this.videoSource.muted = true;
          const retryPromise = this.videoSource.play();
          if (retryPromise !== undefined) {
            retryPromise.catch(() => {});
          }
        });
      }
    }

    if (this.onPlayStateChange) this.onPlayStateChange(true);
    this.loop = (now) => {
      if (!this.isPlaying) return;
      const delta = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;

      if (this.videoSource instanceof HTMLVideoElement && !this.videoSource.paused) {
        this.currentTime = this.videoSource.currentTime;
        if (this.clip && (this.currentTime >= this.clip.endTime || this.currentTime < this.clip.startTime)) {
          this.currentTime = this.clip.startTime;
          this.videoSource.currentTime = this.clip.startTime;
        }
      } else {
        this.currentTime += delta;
        if (this.clip && this.currentTime >= this.clip.endTime) {
          this.currentTime = this.clip.startTime; // Loop
        }
      }

      this.renderFrame();

      if (this.onTimeUpdate && this.clip) {
        this.onTimeUpdate(this.currentTime, this.clip.startTime, this.clip.endTime);
      }

      this.animFrameId = requestAnimationFrame(this.loop);
    };

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  pause() {
    this.isPlaying = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stopBgMusic();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.lastSpokenText = '';

    if (this.videoSource instanceof HTMLVideoElement) {
      this.videoSource.pause();
    }

    if (this.onPlayStateChange) this.onPlayStateChange(false);
    this.renderFrame();
  }

  seek(time) {
    if (!this.clip) return;
    this.currentTime = Math.max(this.clip.startTime, Math.min(this.clip.endTime, time));
    if (this.videoSource instanceof HTMLVideoElement) {
      this.videoSource.currentTime = this.currentTime;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.lastSpokenText = '';
    this.renderFrame();
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime, this.clip.startTime, this.clip.endTime);
    }
  }

  // Core Render Method
  renderFrame() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Video Frame according to Reframe Mode
    this.drawVideoBackground(ctx, w, h);

    // 2. Draw Top Hook Banner if enabled
    if (this.settings.showHookBanner && this.settings.hookBannerText) {
      this.drawHookBanner(ctx, w, h);
    }

    // 3. Draw Dynamic Animated Subtitles
    this.drawSubtitles(ctx, w, h);

    // 4. Draw Animated Progress Bar
    if (this.settings.showProgressBar && this.clip) {
      this.drawProgressBar(ctx, w, h);
    }
  }

  drawVideoBackground(ctx, w, h) {
    let img = this.videoSource;
    if (img instanceof HTMLVideoElement && (img.readyState < 2 || img.videoWidth === 0)) {
      if (this.fallbackThumb && (this.fallbackThumb.naturalWidth > 0 || this.fallbackThumb.complete)) {
        img = this.fallbackThumb;
      }
    }

    if (!img) {
      // Solid futuristic fallback
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const sw = img.videoWidth || img.naturalWidth || img.width || 1920;
    const sh = img.videoHeight || img.naturalHeight || img.height || 1080;
    const isAlreadyVertical = (sw / sh) < 0.65;

    if (isAlreadyVertical) {
      // Source is already a full 9:16 vertical short! Render directly 1:1
      ctx.drawImage(img, 0, 0, w, h);
      return;
    }

    const mode = this.settings.reframeMode;

    if (mode === 'split-screen') {
      // Top Half: Video (0 to h/2)
      // Bottom Half: Satisfying neon loop / tunnel
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h / 2);
      ctx.clip();

      // Fit 16:9 source in top half
      const targetAspect = w / (h / 2); // 1080 / 960
      const sourceAspect = sw / sh;
      let drawW, drawH, drawX, drawY;

      if (sourceAspect > targetAspect) {
        drawH = h / 2;
        drawW = drawH * sourceAspect;
        drawX = (w - drawW) / 2 + (this.settings.manualPan / 100) * w;
        drawY = 0;
      } else {
        drawW = w;
        drawH = drawW / sourceAspect;
        drawX = (this.settings.manualPan / 100) * w;
        drawY = (h / 2 - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Divider line
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(0, h / 2 - 3, w, 6);

      // Bottom Half: Satisfying loop asset or procedural rush
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, h / 2, w, h / 2);
      ctx.clip();

      if (this.splitAsset) {
        // Subtle animated zoom/pan on bottom asset
        const t = (this.currentTime * 0.15) % 1;
        const scale = 1.05 + 0.05 * Math.sin(this.currentTime * 2);
        const bw = w * scale;
        const bh = (h / 2) * scale;
        const bx = (w - bw) / 2;
        const by = h / 2 + (h / 2 - bh) / 2;
        ctx.drawImage(this.splitAsset, bx, by, bw, bh);
      } else {
        // Procedural neon grid
        this.drawProceduralNeon(ctx, 0, h / 2, w, h / 2);
      }
      ctx.restore();

    } else if (mode === 'blur-sides') {
      // Background: Blurred full frame
      ctx.save();
      ctx.filter = 'blur(40px) brightness(0.65)';
      ctx.drawImage(img, -w * 0.2, -h * 0.1, w * 1.4, h * 1.2);
      ctx.restore();

      // Foreground: Fitted 16:9 in center
      const fitH = w * (sh / sw);
      const fitY = (h - fitH) / 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 40;
      ctx.drawImage(img, 0, fitY, w, fitH);
      ctx.shadowBlur = 0;

    } else {
      // Full 9:16 Vertical Crop (Speaker tracking / Pan)
      // Determine pan offset based on mode
      let panPercent = this.settings.manualPan;
      if (mode === 'speaker-left') panPercent -= 25;
      if (mode === 'speaker-right') panPercent += 25;

      const isAlreadyVertical = (sw / sh) < 0.65;
      if (isAlreadyVertical) {
        // Source is already a 9:16 vertical short! Render directly 1:1
        ctx.drawImage(img, 0, 0, w, h);
      } else {
        const zoom = Math.max(1.0, this.settings.zoomLevel || 1.0);
        const targetAspect = w / h; // 9 / 16 = 0.5625
        
        // Calculate crop rectangle on source (sw x sh)
        let cropW = sh * targetAspect / zoom;
        let cropH = sh / zoom;
        
        // Pan calculates center X of crop
        const centerX = (sw / 2) + (panPercent / 100) * (sw - cropW);
        let cropX = Math.max(0, Math.min(sw - cropW, centerX - cropW / 2));
        let cropY = (sh - cropH) / 2;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, w, h);

        // Subtle dark gradient at top and bottom for text readability on cropped landscape footage
        const topGrad = ctx.createLinearGradient(0, 0, 0, 240);
        topGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
        topGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, w, 240);
      }
    }
  }

  drawProceduralNeon(ctx, x, y, width, height) {
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, width, height);

    // Glowing lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 3;
    const t = this.currentTime * 120 % 50;
    for (let i = 0; i < height; i += 40) {
      const lineY = y + ((i + t) % height);
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
    }
  }

  drawHookBanner(ctx, w, h) {
    const text = this.settings.hookBannerText;
    const bannerY = 160;

    ctx.save();
    ctx.font = '900 38px "Outfit", "Arial Black", sans-serif';
    const textMetrics = ctx.measureText(text);
    const textW = textMetrics.width;
    const paddingX = 40;
    const boxW = textW + paddingX * 2;
    const boxH = 74;
    const boxX = (w - boxW) / 2;

    // Glowing pill container
    ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 24;

    const pillGrad = ctx.createLinearGradient(boxX, bannerY, boxX + boxW, bannerY + boxH);
    pillGrad.addColorStop(0, '#ef4444');
    pillGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = pillGrad;

    this.roundRect(ctx, boxX, bannerY, boxW, boxH, 37);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Banner Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, bannerY + boxH / 2);

    ctx.restore();
  }

  drawSubtitles(ctx, w, h) {
    if (!this.clip || !this.clip.subtitles) return;

    // Support both absolute timestamps (startTime..endTime) and relative timestamps (0..clipDuration)
    const curTime = this.currentTime;
    const clipStart = this.clip.startTime || 0;
    const relTime = curTime - clipStart;

    const activeSub = this.clip.subtitles.find(s => {
      if (curTime >= s.start && curTime <= s.end) return true;
      if (relTime >= s.start && relTime <= s.end) return true;
      return false;
    });
    if (!activeSub) return;

    if (this.isPlaying && activeSub.text) {
      this.speakSubtitle(activeSub.text);
    }

    // Split into words for karaoke animation
    let fullText = activeSub.text;
    if (this.settings.showEmojis && activeSub.emoji) {
      fullText = `${fullText} ${activeSub.emoji}`;
    }
    if (this.settings.uppercaseSubtitles) {
      fullText = fullText.toUpperCase();
    }

    const words = fullText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    // Determine which word is currently highlighted based on time progress
    const subDuration = Math.max(0.1, activeSub.end - activeSub.start);
    const subRefTime = (activeSub.start >= clipStart && clipStart > 0) ? curTime : relTime;
    const subProgress = Math.min(1.0, Math.max(0.0, (subRefTime - activeSub.start) / subDuration));
    const activeWordIndex = Math.min(words.length - 1, Math.floor(subProgress * words.length));

    // Subtitle Position: Base of video (Default), Middle, or Top
    let subY = h * 0.81; // Optimal center of the clean base zone (leaves faces and bottom channel text 100% visible)
    if (this.settings.subtitlePosition === 'top') subY = h * 0.22;
    if (this.settings.subtitlePosition === 'middle') subY = h * 0.50;
    if (this.settings.subtitlePosition === 'bottom' || this.settings.subtitlePosition === 'base') subY = h * 0.81;

    // Split-screen adjustment if desired
    if (this.settings.reframeMode === 'split-screen' && this.settings.subtitlePosition === 'middle') {
      subY = h * 0.50;
    }

    const style = this.settings.subtitleStyle || 'hormozi';
    const fontSize = this.settings.subtitleSize || 48;
    const fontFam = this.settings.subtitleFont || '"Arial Rounded MT Bold", "Outfit", "Arial Black", sans-serif';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Prepare Font according to Style
    if (style === 'cyberpunk') {
      ctx.font = `800 ${fontSize}px "JetBrains Mono", "Courier New", monospace`;
    } else if (style === 'minimal') {
      ctx.font = `700 ${fontSize - 4}px "Plus Jakarta Sans", -apple-system, sans-serif`;
    } else {
      ctx.font = `900 ${fontSize}px ${fontFam}`;
    }

    // Word wrapping: Group words into lines that fit within maxLineWidth
    const maxLineWidth = w * 0.78; // e.g. ~840px on 1080px canvas
    const lines = [];
    let currentLine = [];
    let currentLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordW = ctx.measureText(word + ' ').width;
      if (currentLine.length > 0 && (currentLineWidth + wordW > maxLineWidth)) {
        lines.push({ words: currentLine, width: currentLineWidth });
        currentLine = [{ word, width: wordW, globalIndex: i }];
        currentLineWidth = wordW;
      } else {
        currentLine.push({ word, width: wordW, globalIndex: i });
        currentLineWidth += wordW;
      }
    }
    if (currentLine.length > 0) {
      lines.push({ words: currentLine, width: currentLineWidth });
    }

    // Line heights and Y offsets
    const lineHeight = fontSize * 1.25;
    const totalLines = lines.length;
    const startY = subY - ((totalLines - 1) * lineHeight) / 2;

    // Render Each Line
    lines.forEach((lineObj, lineIndex) => {
      const lineY = startY + (lineIndex * lineHeight);
      let curX = (w - lineObj.width) / 2;

      // Special minimal background pill for the line if minimal style
      if (style === 'minimal') {
        const pillW = lineObj.width + 50;
        const pillH = lineHeight + 12;
        const pillX = (w - pillW) / 2;
        const pillY = lineY - pillH / 2;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        this.roundRect(ctx, pillX, pillY, pillW, pillH, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      lineObj.words.forEach((item) => {
        const word = item.word;
        const wordW = item.width;
        const isCurrent = (item.globalIndex === activeWordIndex);
        const wordCenterX = curX + wordW / 2;

        ctx.save();

        if (style === 'hormozi') {
          // Alex Hormozi: Neon Yellow with bounce for active word, crisp white with thick black stroke for others
          if (isCurrent) {
            const bounceScale = 1.14;
            ctx.translate(wordCenterX, lineY);
            ctx.scale(bounceScale, bounceScale);
            ctx.translate(-wordCenterX, -lineY);

            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 24;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 14;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#facc15';
            ctx.fillText(word, wordCenterX, lineY);
          } else {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 10;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#ffffff';
            ctx.fillText(word, wordCenterX, lineY);
          }
        } else if (style === 'mrbeast') {
          // MrBeast: Bold tilt + neon green / yellow
          if (isCurrent) {
            ctx.translate(wordCenterX, lineY);
            ctx.rotate(-0.05);
            ctx.scale(1.18, 1.18);
            ctx.translate(-wordCenterX, -lineY);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 16;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#22c55e'; // Lime Green
            ctx.fillText(word, wordCenterX, lineY);
          } else {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 12;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#facc15'; // Yellow
            ctx.fillText(word, wordCenterX, lineY);
          }
        } else if (style === 'cyberpunk') {
          if (isCurrent) {
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = '#050505';
            ctx.lineWidth = 10;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#22d3ee';
            ctx.fillText(word, wordCenterX, lineY);
          } else {
            ctx.shadowColor = '#e879f9';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 8;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#f472b6';
            ctx.fillText(word, wordCenterX, lineY);
          }
        } else if (style === 'minimal') {
          ctx.fillStyle = isCurrent ? '#facc15' : '#ffffff';
          ctx.fillText(word, wordCenterX, lineY);
        } else if (style === 'redalert') {
          if (isCurrent) {
            ctx.fillStyle = '#ef4444';
            this.roundRect(ctx, curX - 4, lineY - (fontSize * 0.65), wordW + 8, fontSize * 1.3, 8);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(word, wordCenterX, lineY);
          } else {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 10;
            ctx.strokeText(word, wordCenterX, lineY);

            ctx.fillStyle = '#ffffff';
            ctx.fillText(word, wordCenterX, lineY);
          }
        }

        ctx.restore();
        curX += wordW;
      });
    });

    ctx.restore();
  }

  drawProgressBar(ctx, w, h) {
    const start = this.clip.startTime;
    const end = this.clip.endTime;
    const duration = Math.max(0.1, end - start);
    const progress = Math.min(1.0, Math.max(0.0, (this.currentTime - start) / duration));

    const barH = 10;
    const barY = h - barH;

    // Background track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, barY, w, barH);

    // Active progress fill with glow
    ctx.save();
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 12;

    const progGrad = ctx.createLinearGradient(0, barY, w * progress, barY);
    progGrad.addColorStop(0, '#ec4899');
    progGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = progGrad;
    ctx.fillRect(0, barY, w * progress, barH);

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // --- Web Audio Music & Sound FX Synthesizer ---
  startBgMusic() {
    if (!this.audioCtx || this.settings.bgMusicTrack === 'none') return;
    this.stopBgMusic();

    const now = this.audioCtx.currentTime;
    const track = this.settings.bgMusicTrack;

    this.activeNodes = [];

    if (track === 'lofi') {
      // Warm synth chord pad (Cmaj7 -> Am7)
      const freqs = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4
      freqs.forEach((f, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + idx * 100, now);

        gain.gain.setValueAtTime(0.04, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        this.activeNodes.push(osc, gain, filter);
      });

    } else if (track === 'phonk') {
      // 808 Sub-bass pulse + dark minor chord
      const bassOsc = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(55, now); // A1 bass

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      bassGain.gain.setValueAtTime(0.08, now);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      this.activeNodes.push(bassOsc, bassGain, filter);

    } else if (track === 'suspense') {
      // Cinematic tension drone + heartbeat sub-bass
      const droneOsc = this.audioCtx.createOscillator();
      const droneGain = this.audioCtx.createGain();
      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(55.0, now); // A1 deep tension drone

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(450, now + 30); // Slow tension riser sweep

      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(1.2, now); // Heartbeat pulse (72 bpm)
      lfoGain.gain.setValueAtTime(15, now);
      lfo.connect(droneOsc.frequency);

      droneGain.gain.setValueAtTime(0.08, now);

      droneOsc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.musicGain);

      droneOsc.start(now);
      lfo.start(now);
      this.activeNodes.push(droneOsc, lfo, droneGain, lfoGain, filter);

    } else if (track === 'upbeat') {
      // Arpeggiated upbeat tone
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.05, now);
      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      this.activeNodes.push(osc, gain);
    }
  }

  stopBgMusic() {
    if (this.activeNodes && this.activeNodes.length) {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    }
  }

  playSoundEffect(type) {
    if (!this.audioCtx || !this.settings.soundFxEnabled) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (type === 'whoosh') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.25);

    } else if (type === 'ding') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.5);

    } else if (type === 'pop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  // --- Client-Side High-Definition MP4/WebM Video Export ---
  async exportVideoClip(onProgress) {
    if (!this.clip) throw new Error("No clip selected for export");
    const wasPlaying = this.isPlaying;
    this.pause();

    const clipDuration = this.clip.endTime - this.clip.startTime;
    const fps = 30;
    const totalFrames = Math.floor(clipDuration * fps);
    const frameInterval = 1 / fps;

    // Capture Canvas stream at 30 FPS
    const canvasStream = this.canvas.captureStream(fps);

    // Audio stream mixing
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));

    if (this.audioDest && this.audioDest.stream.getAudioTracks().length > 0) {
      this.audioDest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    }

    if (this.videoSource instanceof HTMLVideoElement) {
      try {
        const vidStream = this.videoSource.captureStream ? this.videoSource.captureStream() : (this.videoSource.mozCaptureStream ? this.videoSource.mozCaptureStream() : null);
        if (vidStream) {
          vidStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
        }
      } catch (e) {
        console.warn("Could not capture video element audio track directly:", e);
      }
    }

    // Determine supported mime type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    }

    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: mimeType,
      videoBitsPerSecond: 6000000 // 6 Mbps High Quality
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise(async (resolve, reject) => {
      mediaRecorder.onstop = () => {
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        resolve({
          blob,
          url: videoUrl,
          filename: `${this.clip.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_short.${ext}`,
          mimeType
        });
      };

      mediaRecorder.start();
      this.startBgMusic();

      // Render frames incrementally
      let currentFrame = 0;
      let exportTime = this.clip.startTime;

      const renderStep = () => {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          this.stopBgMusic();
          if (onProgress) onProgress(100);
          return;
        }

        exportTime = this.clip.startTime + currentFrame * frameInterval;
        this.currentTime = exportTime;
        if (this.videoSource instanceof HTMLVideoElement) {
          this.videoSource.currentTime = exportTime;
        }

        this.renderFrame();

        currentFrame++;
        const percent = Math.min(99, Math.round((currentFrame / totalFrames) * 100));
        if (onProgress && currentFrame % 3 === 0) {
          onProgress(percent);
        }

        // High-speed render step
        setTimeout(renderStep, 8);
      };

      renderStep();
    });
  }
}
