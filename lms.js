(async () => {
  try {
    const iframe = document.querySelector('iframe');
    let doc = document;

    if (iframe && iframe.contentWindow && iframe.contentDocument) {
      doc = iframe.contentDocument;
    }

    const alternatives = doc.querySelectorAll('.h5p-sc-alternatives .h5p-sc-alternative');
    if (!alternatives.length) {
      console.error('🔴 Không tìm thấy câu trả lời nào!');
      return;
    }

    function simulateClick(el) {
      try {
        ['touchstart', 'touchend'].forEach(type => {
          const touch = new TouchEvent(type, { bubbles: true, cancelable: true });
          el.dispatchEvent(touch);
        });

        ['mousedown', 'mouseup', 'click'].forEach(type => {
          const mouse = new MouseEvent(type, { bubbles: true, cancelable: true });
          el.dispatchEvent(mouse);
        });

        requestAnimationFrame(() => { el.click(); });
      } catch (err) {
      }
    }

    let found = false;
    alternatives.forEach(alternative => {
      if (alternative.classList.contains('h5p-sc-is-correct')) {
        found = true;
        simulateClick(alternative);
      }
    });

    if (!found) {
      console.warn('🟡 Tutu, hình như t dell thấy đáp án');
    }

    console.log('🟢 đang tìm tutu..');
  } catch (err) {
    console.error('🔴🔴🔴VCL Nếu mày dùng code mà thấy dòng này thì kêu t', err);
  }
})();
