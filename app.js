import { upload } from './upload';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  // firebase config...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();
const storageRef = (path) => ref(storage, path);

upload('#file', {
  multi: true,
  accept: ['.png', '.jpg', '.jpeg', '.gif'],
  /**
   *
   * @param {Array<File>} files
   * @param { NodeListOf<HTMLElementTagNameMap[string]>} blocks
   */
  onUpload(files, blocks) {
    files.forEach((file, index) => {
      const fileRef = storageRef(`images/${ file.name }`);

      const uploadTask = uploadBytesResumable(fileRef, file);
      const infoProgressNode = blocks[index].querySelector('.preview-info-progress');
      const imgNode = blocks[index].parentNode.querySelector('img');

      /**
       * Register three observers:
       * 1. 'state_changed' observer, called any time the state changes
       * 2. Error observer, called on failure
       * 3. Completion observer, called on successful completion
       */
      uploadTask.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%';

          infoProgressNode.textContent = progress;
          infoProgressNode.style.width = progress;
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error(error);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);

            const parent = imgNode.parentNode;

            const linkWithImage = document.createElement('a');
            linkWithImage.href = downloadURL;
            linkWithImage.setAttribute('target', '_blank');
            linkWithImage.innerHTML = `
            <img src="${ downloadURL }" alt="${ file.name }" />
            `;

            imgNode.remove();
            parent.appendChild(linkWithImage);
          });
        }
      );
    });
  }
});
