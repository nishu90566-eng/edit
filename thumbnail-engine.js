// thumbnail-engine.js - High-CTR Viral Thumbnail Generator & Canvas Renderer

export class ThumbnailEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    // Default 9:16 Shorts Thumbnail (1080x1920)
    this.width = 1080;
    this.height = 1920;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.imageSource = null;
    this.headline = "WAIT TILL THE END!";
    this.subtext = "Secret Revealed";
    this.badge = "VIRAL ALERT 🔥";
    this.textColor = "#facc15";
    this.accentColor = "#ef4444";
    this.showGlowBorder = true;
    this.contrastBoost = true;
  }

  setImage(imageSource) {
    this.imageSource = imageSource;
    if (imageSource instanceof HTMLImageElement && !imageSource.complete) {
      imageSource.onload = () => {
        this.render();
      };
    }
    this.render();
  }

  updateConfig(config) {
    if (config.headline !== undefined) this.headline = config.headline;
    if (config.subtext !== undefined) this.subtext = config.subtext;
    if (config.badge !== undefined) this.badge = config.badge;
    if (config.textColor !== undefined) this.textColor = config.textColor;
    if (config.accentColor !== undefined) this.accentColor = config.accentColor;
    if (config.showGlowBorder !== undefined) this.showGlowBorder = config.showGlowBorder;
    if (config.contrastBoost !== undefined) this.contrastBoost = config.contrastBoost;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background Image with Contrast & Saturation Boost
    if (this.imageSource) {
      ctx.save();
      if (this.contrastBoost) {
        ctx.filter = 'contrast(1.25) saturate(1.35) brightness(1.05)';
      }
      
      const sw = this.imageSource.videoWidth || this.imageSource.naturalWidth || this.imageSource.width || 1920;
      const sh = this.imageSource.videoHeight || this.imageSource.naturalHeight || this.imageSource.height || 1080;

      // Center crop to 9:16
      const targetAspect = w / h;
      const cropW = sh * targetAspect;
      const cropH = sh;
      const cropX = (sw - cropW) / 2;
      const cropY = 0;

      ctx.drawImage(this.imageSource, cropX, cropY, cropW, cropH, 0, 0, w, h);
      ctx.restore();
    } else {
      // Futuristic Dark Gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. High-CTR Vignette & Overlays
    const topVignette = ctx.createLinearGradient(0, 0, 0, 480);
    topVignette.addColorStop(0, 'rgba(0,0,0,0.85)');
    topVignette.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topVignette;
    ctx.fillRect(0, 0, w, 480);

    const btmVignette = ctx.createLinearGradient(0, h - 550, 0, h);
    btmVignette.addColorStop(0, 'rgba(0,0,0,0)');
    btmVignette.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = btmVignette;
    ctx.fillRect(0, h - 550, w, 550);

    // 3. Glowing Border
    if (this.showGlowBorder) {
      ctx.save();
      ctx.strokeStyle = this.textColor;
      ctx.lineWidth = 18;
      ctx.shadowColor = this.textColor;
      ctx.shadowBlur = 30;
      ctx.strokeRect(9, 9, w - 18, h - 18);
      ctx.restore();
    }

    // 4. Viral Badge (Top Area)
    if (this.badge) {
      ctx.save();
      const badgeY = 140;
      ctx.font = '900 42px "Outfit", "Arial Black", sans-serif';
      const bMetrics = ctx.measureText(this.badge);
      const bW = bMetrics.width + 60;
      const bH = 80;
      const bX = (w - bW) / 2;

      // Badge Background
      ctx.shadowColor = this.accentColor;
      ctx.shadowBlur = 24;
      const bGrad = ctx.createLinearGradient(bX, badgeY, bX + bW, badgeY + bH);
      bGrad.addColorStop(0, this.accentColor);
      bGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = bGrad;

      this.roundRect(ctx, bX, badgeY, bW, bH, 40);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Badge Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.badge, w / 2, badgeY + bH / 2);
      ctx.restore();
    }

    // 5. Massive Headline (Center-Bottom)
    if (this.headline) {
      ctx.save();
      const headlineY = h - 340;
      ctx.font = '900 76px "Outfit", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Deep 3D Shadow / Stroke
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 8;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 22;
      ctx.strokeText(this.headline, w / 2, headlineY);

      // Inner fill
      ctx.fillStyle = this.textColor;
      ctx.fillText(this.headline, w / 2, headlineY);
      ctx.restore();
    }

    // 6. Subtext Pill (Bottom)
    if (this.subtext) {
      ctx.save();
      const subY = h - 210;
      ctx.font = '800 48px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const sMetrics = ctx.measureText(this.subtext);
      const sW = sMetrics.width + 50;
      const sH = 72;
      const sX = (w - sW) / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      this.roundRect(ctx, sX, subY - sH / 2, sW, sH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.subtext, w / 2, subY);
      ctx.restore();
    }
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

  downloadAsImage(filename = 'viral_short_thumbnail.png', fallbackUrl = null) {
    try {
      const dataUrl = this.canvas.toDataURL('image/png', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn("Canvas toDataURL failed or tainted, falling back to direct image asset", e);
      const link = document.createElement('a');
      link.href = fallbackUrl || (this.imageSource && this.imageSource.src) || 'assets/clip_1_intro_thumb.jpg';
      link.download = filename.replace('.png', '.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
