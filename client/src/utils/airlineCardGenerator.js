/**
 * Generates high-resolution branded cards with company logo and aircraft livery
 * for the React Bits CircularGallery 3D carousel.
 */
export const createAirlineCardImage = (airline, baseImgSrc) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(baseImgSrc);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = 700;
        const height = 900;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(baseImgSrc);

        // 1. Draw base airplane photo (cover crop)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const targetAspect = width / height;
        let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

        if (imgAspect > targetAspect) {
          sWidth = img.naturalHeight * targetAspect;
          sx = (img.naturalWidth - sWidth) / 2;
        } else {
          sHeight = img.naturalWidth / targetAspect;
          sy = (img.naturalHeight - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

        // 2. Deep Top Gradient (for crisp logo visibility)
        const topGrad = ctx.createLinearGradient(0, 0, 0, 240);
        topGrad.addColorStop(0, 'rgba(5, 13, 26, 0.88)');
        topGrad.addColorStop(0.5, 'rgba(5, 13, 26, 0.6)');
        topGrad.addColorStop(1, 'rgba(5, 13, 26, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, 240);

        // 3. Deep Bottom Gradient (for airline name, fleet specs & price)
        const bottomGrad = ctx.createLinearGradient(0, height - 320, 0, height);
        bottomGrad.addColorStop(0, 'rgba(5, 13, 26, 0)');
        bottomGrad.addColorStop(0.35, 'rgba(5, 13, 26, 0.7)');
        bottomGrad.addColorStop(1, 'rgba(5, 13, 26, 0.95)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height - 320, width, 320);

        // 4. Prominent Company Logo Badge at Top-Left
        const badgeX = 36;
        const badgeY = 36;
        const badgeH = 58;
        const badgePadX = 22;

        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const brandName = airline.name || 'Airline';
        const nameWidth = ctx.measureText(brandName.toUpperCase()).width;
        const badgeW = nameWidth + 80;

        // Badge Background Pill
        ctx.save();
        ctx.beginPath();
        const r = badgeH / 2;
        ctx.roundRect
          ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, r)
          : ctx.rect(badgeX, badgeY, badgeW, badgeH);
        ctx.fillStyle = airline.primaryColor || '#0284c7';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.stroke();

        // Carrier Code Circle
        ctx.beginPath();
        const circleR = 19;
        const circleX = badgeX + 30;
        const circleY = badgeY + badgeH / 2;
        ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Carrier Code Text
        ctx.font = '900 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = airline.primaryColor || '#0284c7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(airline.code || 'FL', circleX, circleY);

        // Company Name in Badge
        ctx.font = '800 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(brandName.toUpperCase(), circleX + 28, circleY);
        ctx.restore();

        // Top Right: Verified Partner Pill
        ctx.save();
        const verifiedText = 'VERIFIED FLEET';
        ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const vWidth = ctx.measureText(verifiedText).width;
        const vPillW = vWidth + 28;
        const vPillH = 36;
        const vPillX = width - vPillW - 36;
        const vPillY = 46;

        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(vPillX, vPillY, vPillW, vPillH, 18)
          : ctx.rect(vPillX, vPillY, vPillW, vPillH);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`✓ ${verifiedText}`, vPillX + vPillW / 2, vPillY + vPillH / 2);
        ctx.restore();

        // 5. Bottom Card Branding: Company Name, Aircraft Model & Pricing
        ctx.save();
        // Brand Name Big Header
        ctx.font = '900 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 16;
        ctx.fillText(airline.name, 40, height - 120);

        // Aircraft Model Subtitle
        ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`✈ ${airline.aircraftModel || 'Commercial Aircraft'}`, 40, height - 80);

        // Bottom Highlight Pill (Fares)
        const fareText = `Fares from ₹${Number(airline.startingFare || 2999).toLocaleString('en-IN')}`;
        ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const fareW = ctx.measureText(fareText).width + 32;
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(40, height - 60, fareW, 36, 18)
          : ctx.rect(40, height - 60, fareW, 36);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fareText, 40 + fareW / 2, height - 42);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.warn('Canvas card error, using fallback image:', err);
        resolve(baseImgSrc);
      }
    };
    img.onerror = () => resolve(baseImgSrc);
    img.src = baseImgSrc;
  });
};
