import ImageKit from 'imagekit-javascript'

const SERVER    = process.env.VUE_APP_SERVER
const publicKey = process.env.VUE_APP_IMAGEKIT_KEY
const folder    = process.env.VUE_APP_IMAGEKIT_FOLDER

const urlEndpoint            = 'https://ik.imagekit.io/asu'
const authenticationEndpoint =  SERVER + '/api/auxi/imagekit'

const imagekit = new ImageKit({ publicKey, urlEndpoint, authenticationEndpoint })


class Lib {
  upload(file, fileName, dir) {
    return new Promise((resolve, reject) => {
      imagekit.upload({ file, fileName, folder: `${folder}/${dir}` }, (err, result) => {
        if(err) reject(err)
        resolve(result.url)
      })
    })
  }
  copy(id) {
    const el = document.querySelector(`#${id}`)

    if(navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange()
      range.selectNodeContents(el)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      el.setSelectionRange(0, 999999)
    }
    else el.select()

    document.execCommand('copy')
  }
}

export default new Lib()
