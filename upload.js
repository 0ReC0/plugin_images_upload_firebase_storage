function formatBytes(bytes, decimals = 2) {
  if (!bytes) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const element = (tag, classes = [], content) => {
  const node = document.createElement(tag);

  if (classes.length) {
    node.classList.add(...classes);
  }

  if (content) {
    node.textContent = content;
  }

  return node;
};

export function upload(selector, options = {}) {
  /** Files is Map with key: value like fileName: file */
  let files;
  const onUpload = options.onUpload ?? (() => {});
  const input = document.querySelector(selector);
  const preview = element('div', ['preview']);
  const openBtn = element('button', ['btn'], 'Открыть');
  const uploadBtn = element('button', ['btn', 'primary', 'd-none'], 'Загрузить');

  if (options.multi) {
    input.setAttribute('multiple', true);
  }

  if (options.accept && Array.isArray(options.accept)) {
    input.setAttribute('accept', options.accept.join(','))
  }

  input.insertAdjacentElement("afterend", preview);
  input.insertAdjacentElement("afterend", uploadBtn);
  input.insertAdjacentElement("afterend", openBtn);

  const triggerInput = () => input.click();

  const changeHandler = (event) => {
    if (!event.target.files.length) {
      return;
    }

    // Create map of files to fast find el by FileName
    files = new Map([...event.target.files].map(file => [file.name, file]));

    preview.innerHTML = '';
    uploadBtn.classList.remove('d-none');

    files.forEach((file, fileName) => {
      if (!file.type.match('image')) {
        return;
      }

      const reader = new FileReader();

      reader.onload = (ev) => {
        const src = ev.currentTarget.result;
        const fileSize = formatBytes(file.size, 0);

        const previewHtml = `
            <div class="preview-image">
              <div class="preview-remove" data-name="${ fileName }">&times;</div>
              <img src="${ src }" alt="${ fileName }" />
              <div class="preview-info">
                <span>${ fileName }</span>
                ${ fileSize }
              </div>
            </div>
        `;

        preview.insertAdjacentHTML('afterbegin', previewHtml);
      };

      reader.readAsDataURL(file);
    })
  };

  const removeHandler = (event) => {
    if (!event.target.dataset.name) {
      return;
    }

    const {name} = event.target.dataset;
    files.delete(name);

    if(!files.size){
      uploadBtn.classList.add('d-none');
    }

    // Delete Preview Image block
    event.target.parentNode.classList.add('removing');
    const timeout = setTimeout(() => {
      event.target.parentNode.remove();
      clearTimeout(timeout);
    }, 300);
  };

  const clearPreview = (el, fileName) => {
    el.style.bottom = '4px';
    el.innerHTML = `<div data-name="${fileName}" class="preview-info-progress"></div>`
  }

  const uploadHandler = () => {
    preview
      .querySelectorAll('.preview-remove')
      .forEach(el => {
        // Replace info about file by progress bar and delete remove btn
        const prevInfo = el.parentNode.querySelector('.preview-info');
        clearPreview(prevInfo, el.dataset.name);
        el.remove();
      });
    const previewInfo = preview.querySelectorAll('.preview-info');
    onUpload([...files.values()], previewInfo);
  }

  openBtn.addEventListener('click', triggerInput);
  input.addEventListener('change', changeHandler);
  preview.addEventListener('click', removeHandler);
  uploadBtn.addEventListener('click', uploadHandler);
}
