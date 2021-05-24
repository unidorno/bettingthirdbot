const firebase_connect = require('firebase')

const fb = firebase_connect.initializeApp({
    apiKey:'AIzaSyBiSZeKCsZHwFotMb358IrEiYZYvBbRhhg',
    authDomain:'emptytest-157e6.firebaseapp.com',
    databaseURL: 'https://emptytest-157e6.firebaseio.com/'
})

module.exports = fb