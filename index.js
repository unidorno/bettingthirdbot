const TelegramBot = require('node-telegram-bot-api')
//const mongoose = require('mongoose')
var GeoPoint = require('geopoint')
const debug = require('./helpers')
const config = require('./config')
const database = require('./database.json')
const keyboards = require('./src/keyboard-buttons')
//const firebase = require('./firebase_connect')
console.log('bot has been started...')

//====================INITIALIZE FIREBASE==============================
import * as functions from "firebase-functions"
import * as functions from "express"
import * as functions from "cors"

const firebase_connect = require('firebase')

const fb = firebase_connect.initializeApp({
    apiKey:'AIzaSyBiSZeKCsZHwFotMb358IrEiYZYvBbRhhg',
    authDomain:'emptytest-157e6.firebaseapp.com',
    databaseURL: 'https://emptytest-157e6.firebaseio.com/'
})

//====================================================================
//=====================INITIALIZE MONGOOSE============================

/*mongoose.connect(config.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 0,
    keepAlive: true,
    //reconnectTries: 30
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

require('./models/categories.models')

const Category = mongoose.model('categories')

database.cities.forEach(c => new Category(c).save())*/
//=====================================================================
//=======================KEYBOARDS=====================================
let NurSultan_keyboard = []
let Almaty_keyboard = []
//=====================================================================

const bot = new TelegramBot(config.TOKEN,
    {
        polling:
            {
                interval: 300,
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
    })

// text variables
var owner_chatid = 0
var moderator_chatid = 0
var current_chatid = 0
var tg_username = '@thermite28'
var tg_username_link = 'https://t.me/thermite28'

let temp_message = 0
var userCity = 0 // 0-NurSultan, 1-Almaty
var userPoint = 0
//
let userCategory = 0
let userCategories = []
let category_keyboard = []
let categories_count = 0
//
let userFood
let userFoodlist = []
let foodlist_keyboard = []
let foodlist_count = 0
/////////////////////////////////////////////////////////////////
const choosepoint_text = '🛒 Заказать здесь'
const anotherpoint_text = '◀️ Выбрать другое заведение'
const anothercategory_text = '◀️ Выбрать другую категорию'
let anotherpoint_multiple = 0
const choosecity_text = '◀️ Выбрать другой город'
const whereareyoufrom_text = 'Добрый день. Выберите, из какого вы города:'
const youchosecafe_text = 'Вы выбрали кофейню Coffee BOOM, которая находится по адресу: '
const sendlocation = '📍 Отметить на карте'
const choosecategory_text = 'Выберите категорию блюда, которое хотите заказать:'
const choosefood_text = 'Выберите блюдо, которое хотите заказать:'
const addto_basket_text = '✅ Добавить в корзину'
const changefoodamount_basket_text = '✏️ Изменить количество'
const addto_basket_text2 = 'Готово'
const addto_basket_text3 = 'Готово.'
const dont_addto_basket_text2 = '🗑 Удалить'
const anotherfood_text = '◀️ Назад к списку блюд'
const anotherfood_text2 = '◀️ Назад к списку'
const chooseamountoffood_text = 'Введите нужное количество: '
const editbasket_text = '✏️ Редактировать корзину'
const paybasket_text = '💳 Перейти к оплате'
const youwanttochangepoint_text = 'Вы точно хотите сделать предзаказ в другом заведении? При смене заведения придется выбирать блюда снова'
const query_deletethismessage = 'Нет, не хочу'
const choosefoodtoedit_text = 'Выберите номер блюда, которое нужно отредактировать:'
const delete_basketfood = '🗑  Удалить'
const basketisempty_text = 'Теперь корзина пустая. Давай наполним ее 😏'
const mybasket_text = '🛒 Моя корзина'
const choosetime_text = 'Через сколько минут Вы хотите получить заказ? (мин. 15 мин)'
const chooseanothertime_text = '⏳ Выбрать другое время'
const paybutton_text = '💳 Оплатить'
const afterorder_keyboard1 = '✅ Я получил заказ'
const afterorder_keyboard2 = '📍 Место выдачи'
const afterorder_keyboard3 = '❓ Служба поддержки'
const didyougetorder_text = 'Вы точно получили свой заказ? Данные о заказе могут не сохраниться'
const yesigotorder_text = 'Да, заказ получен'
const noigotorder_text = 'Я еще не забрал заказ'
const help_phone = '+77077777777'
//
let basket = [] //корзина (массив массивов)
let decrease_foodcount = '-'
let increase_foodcount = '+'
let decrease_foodcount2 = '.-.'
let increase_foodcount2 = '.+.'
let temp_foodamount = 1
let temp_food_price = 0
let temp_food_text = ''
let temp_backet_food = 0
let times = [15, 30, 45]
let finalbasket = ''
let finalprice = 0
let finaltime_deelay = ''
let finaltime = new Date()
let finalplace = ''
//
//var NurSultan_adresses = ['Мәңгілік Ел, 47', 'Мәңгілік Ел, 28', 'Рақымжан Қошқарбаев, 10/1']
var NurSultan_adresses = []
//var NurSultan_geo1 = [51.0984065,51.09264,51.1288777]
//var NurSultan_geo2 = [71.4251721,71.3892069,71.4577355]
var NurSultan_geo1 = []
var NurSultan_geo2 = []
/////////////////////////////////////////////////////////////////
var Almaty_adresses = ['Мәңгілік Ел, 47', 'Мәңгілік Ел, 28', 'Рақымжан Қошқарбаев, 10/1']
var Almaty_geo1 = [51.0984065,51.09264,51.1288777]
var Almaty_geo2 = [71.4251721,71.3892069,71.4577355]
/////////////////////////////////////////////////////////////////
var userlocation = [0.1,0.1]
var nearest_place = 0 //номер ближайшего заведения(в массиве)
var min_distance = 9999999

GetPoints_NurSultan()
GetPoints_Almaty()

bot.on("polling_error", console.log);

bot.on('pre_checkout_query', pre_checkout_query => {
    bot.answerPreCheckoutQuery( pre_checkout_query.id, true, {
        error_message: 'При оплате произошла ошибка. Попробуйте повторить действие позже'
    })

})

bot.on('successful_payment', successful_payment => {
   // console.log('info: ' + successful_payment.)
   const chatId = successful_payment.chat.id
   finaltime.Date = Date.now()
   finaltime.setMinutes( finaltime.getMinutes() + finaltime_deelay);
    const text = `Ваш заказ принят 👍
` + finalbasket
    bot.sendMessage(chatId, text).then(() => {
        const contact_text = `Вы сможете забрать заказ по адресу: <b>` + NurSultan_adresses[userPoint] + `</b> в <b>` + finaltime.getHours() + ':' + finaltime.getMinutes() + `</b>`
        bot.sendMessage(chatId, contact_text, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: 
                [[
                    {
                        text: afterorder_keyboard1
                    }
                ],[
                    {
                        text: afterorder_keyboard2
                    },
                    {
                        text: afterorder_keyboard3
                    }
                ]],
                    resize_keyboard: true
                }
        }).then(() => {
            bot.sendLocation(chatId, NurSultan_geo1[userPoint], NurSultan_geo2[userPoint])
        })
    })

   // bot.forwardMessage(owner_chatid, current_chatid, current_chatid.username)

   /* const owner_notification_text = `<b>💰 Новая покупка!</b>
Услуга: `+ current_item +`
Стоимость: `+ current_price +` тенге
Способ оплаты: `+ current_pmethod +`
Пользователь: @`+ successful_payment.user_id +`
`
    bot.sendMessage(owner_chatid,owner_notification_text, {
        parse_mode: 'HTML'
    })*/
})

bot.on('location', (msg) => {
    userlocation[0] = msg.location.latitude
    userlocation[1] = msg.location.longitude
    let point1 = new GeoPoint(userlocation[0], userlocation[1], false)
    if (userCity === 0){
        for (let i = 0; i < NurSultan_adresses.length; i++) {
            let point2 = new GeoPoint(NurSultan_geo1[i], NurSultan_geo2[i], false)
            let distance = point1.distanceTo(point2, true)//output in kilometers
            //console.log('дистанция до адреса: ' + NurSultan_adresses[i] + ' = ' + distance)
            if (distance < min_distance){
                min_distance = distance
                nearest_place = i
            }
            if (i === NurSultan_adresses.length - 1) {
                userPoint = nearest_place
                bot.sendLocation(msg.chat.id, NurSultan_geo1[nearest_place], NurSultan_geo2[nearest_place]).then(() => {
                    bot.sendMessage(msg.chat.id, 'Ближайшая к этой локации точка Coffee BOOM находится по адресу: ' + NurSultan_adresses[nearest_place], {
                        reply_markup:{
                            inline_keyboard:
                            [
                                [{
                                    text: choosepoint_text,
                                    callback_data: choosepoint_text
                                },
                                {
                                        text: anotherpoint_text,
                                        callback_data: anotherpoint_text
                                }]
                            ]
                        }
                    })
                })
            }
        }
    }
    else if (userCity === 1){
        for (let i = 0; i < Almaty_adresses.length; i++) {
            let point2 = new GeoPoint(Almaty_geo1[i], Almaty_geo2[i], false)
            let distance = point1.distanceTo(point2, true)//output in kilometers
            if (distance < min_distance){
                min_distance = distance
                nearest_place = i
            }
            if (i === Almaty_adresses.length - 1) {
                userPoint = nearest_place
                bot.sendLocation(msg.chat.id, Almaty_geo1[nearest_place], Almaty_geo2[nearest_place]).then(() => {
                    bot.sendMessage(msg.chat.id, 'Ближайшая к этой локации точка Coffee BOOM находится по адресу: ' + Almaty_adresses[nearest_place], {
                        reply_markup:{
                            inline_keyboard:
                                [
                                    [{
                                        text: choosepoint_text,
                                        callback_data: choosepoint_text
                                    },
                                        {
                                            text: anotherpoint_text,
                                            callback_data: anotherpoint_text
                                        }]
                                ]
                        }
                    })
                })
            }
        }
    }
   // console.log('chat id: ' + msg.chat.id + /*'. Message_id: ' + msg.message + */'. Message_id2: ' + msg.message_id)
   for (let i = 0; i < 4; i++){
        if (msg.message_id - i > 0){
            if (i!== 0){
                bot.deleteMessage(msg.chat.id, msg.message_id - i)
            }
        }
   }
})

bot.on('message', (msg) =>
{
    const chatId = msg.chat.id

    if (msg.text === anotherpoint_text){
        finalprice = 0
        finaltime_deelay = 0
        finalbasket = 0
        console.log('2414124')
        if (userFood !== null || userFoodlist !== []){
            bot.deleteMessage(chatId, msg.message_id)
            bot.sendMessage(chatId, youwanttochangepoint_text, {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: anotherpoint_text,
                            callback_data: anotherpoint_text
                        },{
                            text: query_deletethismessage,
                            callback_data: query_deletethismessage
                        }]
                    ],
                },
                remove_keyboard: true
            })
        }
        else {

        }
    }

    if (msg.text === mybasket_text){
        finalprice = 0
        finaltime_deelay = 0
        bot.deleteMessage(chatId, msg.message_id)
        bot.deleteMessage(chatId, msg.message_id - 1).then(() => {
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket.length; i++){
                            finalsum += (basket[i][2] * basket[i][1])
                            if (i === basket.length - 1){
                                editmsg += finalsum + 'тг.'
                                console.log(finalsum + ' ' + i)
                                for (let i = 0; i < basket.length; i++){
                                    console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                                    editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                                    if (i === basket.length - 1){
                                        bot.sendMessage(chatId,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2,
                                                        callback_data: anotherfood_text2
                                                    }],
                                                    [{
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }]
                                                ]
                                            }
                                        })
            
                                    }
                                }
                            }
            }
        })
        
    }

    if (msg.text === paybasket_text){
        finaltime_deelay = 0
        finalplace = NurSultan_adresses[userPoint]
        bot.deleteMessage(chatId, msg.message_id - 1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket.length; i++){
                            finalsum += (basket[i][2] * basket[i][1])
                            if (i === basket.length - 1){
                                editmsg += finalsum + 'тг.'
                                console.log(finalsum + ' ' + i)
                                for (let i = 0; i < basket.length; i++){
                                    console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                                    editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                                    if (i === basket.length - 1){
                                        finalbasket = editmsg
                                        finalprice = finalsum
                                        bot.sendMessage(chatId,  editmsg).then(() => {
                                            bot.sendMessage(chatId, choosetime_text, {
                                                reply_markup:{
                                                    inline_keyboard: [
                                                        [{
                                                            text: times[0].toString() + ' минут',
                                                            callback_data: times[0].toString() + ' минут'
                                                        },
                                                        {
                                                            text: times[1].toString() + ' минут',
                                                            callback_data: times[1].toString() + ' минут'
                                                        },
                                                        {
                                                            text: times[2].toString() + ' минут',
                                                            callback_data: times[2].toString() + ' минут'
                                                        },
                                                    ]
                                                    ]
                                                }
                                            })
                                        })
            
                                    }
                                }
                            }
            }
        })
    }

    if (msg.text === afterorder_keyboard1){
        bot.sendMessage(chatId, didyougetorder_text, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: yesigotorder_text,
                            callback_data: yesigotorder_text
                        }
                    ],
                    [
                        {
                            text: noigotorder_text,
                            callback_data: query_deletethismessage
                        }
                    ]
                ]
            }
        })
    }
    if (msg.text === afterorder_keyboard2){
        bot.sendLocation(chatId, NurSultan_geo1[userPoint], NurSultan_geo2[userPoint])
    }
    if (msg.text === afterorder_keyboard3){
        bot.sendContact(chatId, help_phone, 'Coffee BOOM', {
            last_name: 'Служба поддержки'
        })
    }

})

bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message

    if (query.data === query_deletethismessage){
        bot.deleteMessage(chat.id, message_id)
    }

    if (query.data === choosecity_text){
        userPoint = ''
        bot.editMessageText(whereareyoufrom_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Нур-Султан',
                            callback_data: 'Нур-Султан'
                        }]/*,
                        [{
                            text: 'Алматы',
                            callback_data: 'Алматы'
                        }]*/
                    ]
                }
            })
    }

    if (query.data === 'Нур-Султан'){
        userCity = 0
        const textmsg = `Вы выбрали <b>` + query.data +`</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
        bot.editMessageText(textmsg,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:NurSultan_keyboard
                }
            })
    }

    if (query.data === 'Алматы'){
        userCity = 1
        const textmsg = `Вы выбрали <b>` + query.data +`</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
        bot.editMessageText(textmsg,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard: Almaty_keyboard
                }
            })
    }

    if (query.data === sendlocation){
        const msgtext = `Отправьте нам свою локацию, и мы найдем ближайший <b>Coffee BOOM</b> ☕️. Для этого нажмите на иконку скрепки (слева снизу) и выберите <b>"Геопозиция"</b>
🏪 Вы также можете отметить заведение на карте`
        bot.sendVideo(chat.id, './pictures/tutorial.mp4').then(() => {
            bot.sendMessage(chat.id, msgtext, {parse_mode: 'HTML'})
        })
    }

    if (query.data === anotherpoint_text){
        if (userCity === 0){
            let minus = 1
            if (userFood !== undefined){
                console.log('Убираем клавиатуру в конце покупки при смене заведения ' + userFood + '  ' + userFoodlist)
                userFood = undefined
                userFoodlist = []
                minus = 2
                anotherpoint_multiple = 3
                basket = []
            }
            userPoint = ''
            const textmsg = `Вы выбрали <b>Нур-Султан</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
            console.log('message to delete: ' + temp_message)
            for (let i = 0; i < 100; i++){
                bot.deleteMessage(chat.id, message_id - i - 1).then(() => {
                    console.log('MESSAGE FOUND. LOL ')
                    i = 101
                }).catch(error => {
                    console.log('MESSAGE NOT FOUND. MINUS++ ' + error)
                    minus++
                })
            }       
            if (anotherpoint_multiple !== 0){
                //
                for (let i = 0; i < 100; i++){
                    bot.deleteMessage(chat.id, message_id - i - 1).then(() => {
                        console.log('2 MESSAGE FOUND. LOL ')
                        anotherpoint_multiple = 0
                        i = 101
                    }).catch(error => {
                        console.log('2 MESSAGE NOT FOUND. MINUS++ ' + error)
                        anotherpoint_multiple++
                    })
                }  
                
            }
            bot.editMessageText(textmsg,
                {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_id,
                    reply_markup:{
                        inline_keyboard: NurSultan_keyboard,
                    }
                }).catch(error => {
                    console.log(error)
                })
        }
        if (userCity === 1){
            userPoint = ''
            const textmsg = `Вы выбрали <b>Алматы</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
            bot.editMessageText(textmsg,
                {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_id,
                    reply_markup:{
                        inline_keyboard: Almaty_keyboard
                    }
                })
        }
    }

    //тут создаем клавиатуру с категориями для гостя
    if (query.data === choosepoint_text){
        //console.log(query.message.text)
        //bot.deleteMessage(chat.id, message_id-1)
        anotherpoint_multiple = 2
        keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, userCity, userPoint, fb, bot, chat, message_id, anotherpoint_text, query, choosecategory_text)
    }

    for (let i = 0; i < NurSultan_adresses.length; i++){
        if (query.data === NurSultan_adresses[i]){
            userPoint = i
            bot.deleteMessage(chat.id, message_id).then(
                bot.sendLocation(chat.id, NurSultan_geo1[i], NurSultan_geo2[i]).then(() => {
                    temp_message = message_id
                    bot.sendMessage(chat.id, youchosecafe_text + `<b>` + NurSultan_adresses[i] + `</b>`, {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:
                                [
                                    [{
                                        text: choosepoint_text,
                                        callback_data: choosepoint_text
                                    },
                                        {
                                            text: anotherpoint_text,
                                            callback_data: anotherpoint_text
                                        }]
                                ]
                        }
                    })
            }))
        }
    }
    for (let i = 0; i < userCategories.length; i++){

        if (query.data === userCategories[i]){
            userCategory = i
            console.log('Город: ' + userCity + '. Точка: ' + userPoint + '. Категория: ' + userCategory)
            keyboards.FoodKeyboard(foodlist_keyboard, userFoodlist, foodlist_count, userCity, userPoint, userCategory, fb, bot, chat, message_id, anothercategory_text, query, choosefood_text)
        }
    }
    for (let i = 0; i < userFoodlist.length; i++){
        if (query.data === userFoodlist[i]){
            console.log('Кнопку нашли')
            userFood = i
            let food_photo_link = ''
            let food_description = ''
            temp_food_price = ''
            bot.deleteMessage(chat.id, message_id).then(() => {
                let food_photo = fb.database().ref('cities/'+ userCity +'/points/' + userPoint + '/categories/' + userCategory + '/food/' + i)
                food_photo.get().then((snapshot) =>
                {
                    food_photo_link = snapshot.val().photo
                    food_description = snapshot.val().description
                    temp_food_price = snapshot.val().price

                    if (food_photo_link !== '' && food_description !== '' && temp_food_price !== ''){
                        bot.sendPhoto(chat.id, food_photo_link).then(() => {
                            temp_food_text = `<b>` + userFoodlist[userFood] + `</b>

<b>Описание: </b>
` + food_description + `

<b>💰 Цена: </b>` + temp_food_price + ` тенге`
                            for (let i = 0; i < basket.length; i++){
                                if (basket[i][0] === userFoodlist[userFood]){
                                    console.log('foundfood ' + i)
                                    bot.sendMessage(chat.id, temp_food_text, {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: changefoodamount_basket_text,
                                                    callback_data: addto_basket_text
                                                }],
                                                [{
                                                    text: anotherfood_text,
                                                    callback_data: anotherfood_text
                                                }]
                                            ]
                                        }
                                    })
                                    break
                                }
                                if (i === basket.length - 1 && basket[i][0] !== userFoodlist[userFood]){
                                    console.log('еду не нашли ' + i)
                                    bot.sendMessage(chat.id, temp_food_text, {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: addto_basket_text,
                                                    callback_data: addto_basket_text
                                                }],
                                                [{
                                                    text: anotherfood_text,
                                                    callback_data: anotherfood_text
                                                }]
                                            ]
                                        }
                                    })
                                }
                            }
                            if (basket.length === 0){
                                console.log('корзина пустая')
                                    bot.sendMessage(chat.id, temp_food_text, {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: addto_basket_text,
                                                    callback_data: addto_basket_text
                                                }],
                                                [{
                                                    text: anotherfood_text,
                                                    callback_data: anotherfood_text
                                                }]
                                            ]
                                        }
                                    })
                            }
                        })

                    }

                }).catch((err) => {console.log(err)})
            })
        }
    }
    if (query.data === anothercategory_text){
        bot.editMessageText(choosecategory_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:category_keyboard

                }
            })
    }
    if (query.data === anotherfood_text){
        bot.editMessageText(choosefood_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id, //!!!! НЕ ТОТ МЕССЕДЖ ID УДАЛЯЕМ
                reply_markup:{
                    inline_keyboard:foodlist_keyboard
                }
            })
        bot.deleteMessage(chat.id, message_id - 1)
    }
    if (query.data === anotherfood_text2){
        bot.editMessageText(choosefood_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id, //!!!! НЕ ТОТ МЕССЕДЖ ID УДАЛЯЕМ
                reply_markup:{
                    inline_keyboard:foodlist_keyboard
                }
            })
        //bot.deleteMessage(chat.id, message_id - 1)
    }
    if (query.data === addto_basket_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }) //убираем клаву в описании блюда
        for (let i = 0; i < basket.length; i++){
            console.log('!!!! ' + basket[i][0] + ' ' + userFoodlist[userFood])
            if (basket[i][0] === userFoodlist[userFood]){

                bot.sendMessage(chat.id, chooseamountoffood_text + basket[i][1] + ' x ' + temp_food_price + 'тг. = ' + (basket[i][1] * temp_food_price + 'тг.'), {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: decrease_foodcount,
                                callback_data: decrease_foodcount
                            },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount
                            }],
                            [{
                                
                                text: dont_addto_basket_text2,
                                callback_data: dont_addto_basket_text2
                            },
                            {
                                text: addto_basket_text2,
                                callback_data: addto_basket_text2
                            }]
                        ]
                    }
                })
                break
            }
            if (i === basket.length - 1 && basket[i][0] !== userFoodlist[userFood]){
                //когда мы проверили все ячейки и ни одна не совпала...
                console.log('ALARM2: ' + i + ' ' + basket.length)
                /*if (i === basket.length){
                    bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price + 'тг.'), {
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: decrease_foodcount,
                                    callback_data: decrease_foodcount
                                },
                                    {
                                        text: increase_foodcount,
                                        callback_data: increase_foodcount
                                    }],
                                [{
                                    text: addto_basket_text2,
                                    callback_data: addto_basket_text2
                                },
                                    {
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    }]
                            ]
                        }
                    })
                }*/
                temp_foodamount = 1
                bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price + 'тг.'), {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: decrease_foodcount,
                                callback_data: decrease_foodcount
                            },
                                {
                                    text: increase_foodcount,
                                    callback_data: increase_foodcount
                                }],
                            [{
                                text: dont_addto_basket_text2,
                                callback_data: dont_addto_basket_text2
                            },
                            {
                                text: addto_basket_text2,
                                callback_data: addto_basket_text2
                            }]
                        ]
                    }
                })
            }
        }
        if (basket.length === 0){
            //когда мы проверили все ячейки и ни одна не совпала...
            bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price + 'тг.'), {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount
                        },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount
                            }],
                        [{
                            text: dont_addto_basket_text2,
                            callback_data: dont_addto_basket_text2
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text2
                        }]
                    ]
                }
            })
        }
    }
    //тут мы прибавляем или убавляем кол-во выбранного блюда
    if (query.data === increase_foodcount || query.data === decrease_foodcount){
        console.log(decrease_foodcount + ' ' + increase_foodcount + ' ' + dont_addto_basket_text2 + ' ' + addto_basket_text2)
        if (query.data === increase_foodcount){
            for (let i = 0; i < basket.length; i++){
                console.log('226 ' + basket[i][0] + ' ' + userFoodlist[userFood])
                if (basket[i][0] === userFoodlist[userFood]){
                    basket[i][1]++
                    console.log('increasing existing food postion +1 ' + basket[i][1])
                    bot.editMessageText(chooseamountoffood_text + basket[i][1] + ' x ' + temp_food_price + 'тг. = ' + (basket[i][1] * temp_food_price) + 'тг.', {
                        chat_id: chat.id,
                        message_id: message_id,
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: decrease_foodcount,
                                    callback_data: decrease_foodcount
                                },
                                    {
                                        text: increase_foodcount,
                                        callback_data: increase_foodcount
                                    }],
                                [{
                                    text: dont_addto_basket_text2,
                                    callback_data: dont_addto_basket_text2
                                },
                                {
                                    text: addto_basket_text2,
                                    callback_data: addto_basket_text2
                                }]
                            ]
                        }
                    })
                    break
                }
                if (i === basket.length - 1 && basket[i][0] !== userFoodlist[userFood]){
                    console.log('227 ' + basket[i][0] + ' ' + userFoodlist[userFood])
                    temp_foodamount++
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price) + 'тг.', {
                            chat_id: chat.id,
                            message_id: message_id,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: decrease_foodcount,
                                        callback_data: decrease_foodcount
                                    },
                                        {
                                            text: increase_foodcount,
                                            callback_data: increase_foodcount
                                        }],
                                    [{
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    },
                                    {
                                        text: addto_basket_text2,
                                        callback_data: addto_basket_text2
                                    }]
                                ]
                            }
                        })
                        break
                }
            }
            if (basket.length === 0){
                temp_foodamount++
                bot.editMessageText(chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price) + 'тг.', {
                    chat_id: chat.id,
                    message_id: message_id,
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: decrease_foodcount,
                                callback_data: decrease_foodcount
                            },
                                {
                                    text: increase_foodcount,
                                    callback_data: increase_foodcount
                                }],
                            [{
                                text: dont_addto_basket_text2,
                                callback_data: dont_addto_basket_text2
                            },
                            {
                                text: addto_basket_text2,
                                callback_data: addto_basket_text2
                            }]
                        ]
                    }
                })
            }
        }
        if (query.data === decrease_foodcount){
            console.log('descrease')
            for (let i = 0; i < basket.length; i++){
                if (basket[i][0] === userFoodlist[userFood]){
                    if (basket[i][1] > 1){
                        basket[i][1]--
                        bot.editMessageText(chooseamountoffood_text + basket[i][1] + ' x ' + temp_food_price + 'тг. = ' + (basket[i][1] * temp_food_price) + 'тг.', {
                            chat_id: chat.id,
                            message_id: message_id,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: decrease_foodcount,
                                        callback_data: decrease_foodcount
                                    },
                                        {
                                            text: increase_foodcount,
                                            callback_data: increase_foodcount
                                        }],
                                    [{
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    },
                                    {
                                        text: addto_basket_text2,
                                        callback_data: addto_basket_text2
                                    }]
                                ]
                            }
                        })
                    }
                }
                else{
                    //когда мы проверили все ячейки и ни одна не совпала...
                    /*if (i === basket.length){
                        if (temp_foodamount > 1){
                            temp_foodamount--
                            bot.editMessageText(chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price) + 'тг.', {
                                chat_id: chat.id,
                                message_id: message_id,
                                reply_markup:{
                                    inline_keyboard:[
                                        [{
                                            text: decrease_foodcount,
                                            callback_data: decrease_foodcount
                                        },
                                            {
                                                text: increase_foodcount,
                                                callback_data: increase_foodcount
                                            }],
                                        [{
                                            text: addto_basket_text2,
                                            callback_data: addto_basket_text2
                                        },
                                            {
                                                text: dont_addto_basket_text2,
                                                callback_data: dont_addto_basket_text2
                                            }]
                                    ]
                                }
                            })
                        }
                    }*/

                    if (temp_foodamount > 1){
                        temp_foodamount--
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price) + 'тг.', {
                            chat_id: chat.id,
                            message_id: message_id,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: decrease_foodcount,
                                        callback_data: decrease_foodcount
                                    },
                                        {
                                            text: increase_foodcount,
                                            callback_data: increase_foodcount
                                        }],
                                    [{
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    },
                                    {
                                        text: addto_basket_text2,
                                        callback_data: addto_basket_text2
                                    }]
                                ]
                            }
                        })
                        break
                    }
                }
            }
            if (basket.length === 0){
                if (temp_foodamount > 1){
                    temp_foodamount--
                    bot.editMessageText(chooseamountoffood_text + temp_foodamount + ' x ' + temp_food_price + 'тг. = ' + (temp_foodamount * temp_food_price) + 'тг.', {
                        chat_id: chat.id,
                        message_id: message_id,
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: decrease_foodcount,
                                    callback_data: decrease_foodcount
                                },
                                    {
                                        text: increase_foodcount,
                                        callback_data: increase_foodcount
                                    }],
                                [{
                                    text: dont_addto_basket_text2,
                                    callback_data: dont_addto_basket_text2
                                },
                                {
                                    text: addto_basket_text2,
                                    callback_data: addto_basket_text2
                                }]
                            ]
                        }
                    })
                }
            }
        }
    }
    if (query.data === increase_foodcount2 || query.data === decrease_foodcount2){
        if (query.data === increase_foodcount2){
            console.log('Увеличиваем: ' + basket[temp_backet_food][0])
            basket[temp_backet_food][1]++
            bot.editMessageText(chooseamountoffood_text + basket[temp_backet_food][1] + ' x ' + basket[temp_backet_food][2] + 'тг. = ' + (basket[temp_backet_food][1] * basket[temp_backet_food][2]) + 'тг.', {
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount2
                        },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount2
                            }],
                        [{
                            text: dont_addto_basket_text2,
                            callback_data: delete_basketfood
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text3
                        }]
                    ]
                }
            })
        }
        if (query.data === decrease_foodcount2){
            console.log('Уменьшаем: ' + basket[temp_backet_food][0])
            basket[temp_backet_food][1]--
            bot.editMessageText(chooseamountoffood_text + basket[temp_backet_food][1] + ' x ' + basket[temp_backet_food][2] + 'тг. = ' + (basket[temp_backet_food][1] * basket[temp_backet_food][2]) + 'тг.', {
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount2
                        },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount2
                            }],
                        [{
                            text: dont_addto_basket_text2,
                            callback_data: delete_basketfood
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text3
                        }]
                    ]
                }
            })
        }
    }
    if (query.data === dont_addto_basket_text2){
        for (let i = 0; i < basket.length; i++){
            if (userFoodlist[userFood] === basket[i][0]){
                basket.splice(i, 1)
                console.log('DELETED')
                //тут можно выводить список если удаляем предмет, а если еще не добавляли то нет
            }
        }
        bot.deleteMessage(chat.id, message_id).then(() => {
            bot.editMessageText(temp_food_text, {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id - 1,
                reply_markup:{
                    inline_keyboard: [
                        [{
                            text: addto_basket_text,
                            callback_data: addto_basket_text
                        }],
                        [{
                            text: anotherfood_text,
                            callback_data: anotherfood_text
                        }]
                    ]
                }
            })
        })
    }
    if (query.data === addto_basket_text2){
        console.log('!!!!!!!! ' + userFoodlist + '   ' + userFoodlist[userFood])
        for (let i = 0; i < basket.length; i++){
            console.log('0.1')
            if (basket[i][0] === userFoodlist[userFood]){
                console.log('1')
              //  let newfood = [userFoodlist[userFood], temp_foodamount, temp_food_price]
             //   basket[i] = newfood
                bot.deleteMessage(chat.id, message_id)
                bot.deleteMessage(chat.id, message_id - 1)
                bot.deleteMessage(chat.id, message_id - 2).then(() => {
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    for (let i = 0; i < basket.length; i++){
                        finalsum += (basket[i][2] * basket[i][1])
                        if (i === basket.length - 1){
                            editmsg += finalsum + 'тг.'
                            console.log(finalsum + ' ' + i)
                            for (let i = 0; i < basket.length; i++){
                                console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                                editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                                if (i === basket.length - 1){
                                    console.log('2Блюдо: ')
                                    bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: [
                                                [{
                                                    text: mybasket_text
                                                }],
                                                [{
                                                    text: paybasket_text
                                                }],
                                                [{
                                                    text: anotherpoint_text
                                                }]
                                            ],
                                            resize_keyboard: true
        
                                        }
                                    }).then(() => {
                                        bot.sendMessage(chat.id,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2,
                                                        callback_data: anotherfood_text2
                                                    }],
                                                    [{
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }]
                                                ]
                                            }
                                        })
                                    })
        
                                }
                            }
                        }
                    }
                    
                })
                break
            }
            if (i === basket.length - 1 && basket[i][0] !== userFoodlist[userFood]) {
                console.log(userFoodlist[userFood] + ' ' + temp_foodamount + ' ' + temp_food_price)
                let newfood = [userFoodlist[userFood], temp_foodamount, temp_food_price]
                basket.push(newfood)
                temp_foodamount = 1
                bot.deleteMessage(chat.id, message_id)
                bot.deleteMessage(chat.id, message_id - 1)
                bot.deleteMessage(chat.id, message_id - 2).then(() => {
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    
                    for (let i = 0; i < basket.length; i++){
                        finalsum += (basket[i][2] * basket[i][1])
                        if (i === basket.length - 1){
                            editmsg += finalsum + 'тг.'
                            console.log(finalsum + ' ' + i)
                            for (let i = 0; i < basket.length; i++){
                                console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                                editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                                if (i === basket.length - 1){
                                    console.log('2Блюдо: ')
                                    bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: [
                                                [{
                                                    text: mybasket_text
                                                }],
                                                [{
                                                    text: paybasket_text
                                                }],
                                                [{
                                                    text: anotherpoint_text
                                                }]
                                            ],
                                            resize_keyboard: true
        
                                        }
                                    }).then(() => {
                                        bot.sendMessage(chat.id,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2,
                                                        callback_data: anotherfood_text2
                                                    }],
                                                    [{
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }]
                                                ]
                                            }
                                        })
                                    })
        
                                }
                            }
                        }
                    }
                })
                break
            }
        }
        if (basket.length === 0){
            console.log('3')
            let newfood = [userFoodlist[userFood], temp_foodamount, temp_food_price]
            basket.push(newfood)
            bot.deleteMessage(chat.id, message_id)
            bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id - 2).then(() => {
                let editmsg = `Ваш заказ: `
                let finalsum = 0 
                    for (let i = 0; i < basket.length; i++){
                        finalsum += (basket[i][2] * basket[i][1])
                        for (let i = 0; i < basket.length; i++){
                            console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                            editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                            if (i === basket.length - 1){
                                console.log('2Блюдо: ')
                                bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        keyboard: [
                                            [{
                                                text: mybasket_text
                                            }],
                                            [{
                                                text: paybasket_text
                                            }],
                                            [{
                                                text: anotherpoint_text
                                            }]
                                        ],
                                        resize_keyboard: true
        
                                    }
                                }).then(() => {
                                    bot.sendMessage(chat.id,  editmsg , {
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: anotherfood_text2,
                                                    callback_data: anotherfood_text2
                                                }],
                                                [{
                                                    text: editbasket_text,
                                                    callback_data: editbasket_text
                                                }]
                                            ]
                                        }
                                    })
                                })
        
                            }
                        }
                    }
            })
        }
    }

    if (query.data === editbasket_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }).then(() => {
            let keyboard = []
            let line_amount = 1 + Math.floor(basket.length / 4)
            let lastbuttons_amount = basket.length - ((line_amount - 1) * 4)
            console.log('4-х клавишных рядом в клавиатуре: ' + line_amount + '. Кнопок в последнем ряду ( <4 клавиш ): ' + lastbuttons_amount)
            keyboard[0] = [{
                text: anotherfood_text2,
                callback_data: anotherfood_text2
            }]
            for (let i = 1; i < line_amount; i++){
                console.log('Создаем клавиатуру с рядами по 4 кнопки: ' + i)
                keyboard[i] = [{
                    text: i,
                    callback_data: i.toString()
                },
                {
                    text: i+1,
                    callback_data: (i + 1).toString() 
                },
                {
                    text: i+2,
                    callback_data: (i + 2).toString() 
                },
                {
                    text: i+3,
                    callback_data: (i + 3).toString() 
                }]
                if (i === line_amount - 1 && lastbuttons_amount !== 0){
                    console.log('Закончили создавать 4-х клавишные ряды. Создаем последний ряд')
                    keyboard[line_amount] = []
                    for (let b = 1; b < lastbuttons_amount + 1; b++){
                        console.log('b = ' + b + '. lastbuttons_amount = ' + lastbuttons_amount)
                        if (line_amount > 1){
                            keyboard[line_amount].push({
                                text: (4 + b).toString(),
                                callback_data: (4 + b).toString()
                            })
                        }
                        if (line_amount <= 1){
                            keyboard[line_amount].push({
                                text: b.toString(),
                                callback_data: b.toString() 
                            })
                        }
                        if (b === lastbuttons_amount){
                            console.log('Клаву создали, отправляем сообщение с клавиатурой' + b + ' ' + keyboard[line_amount])
                            bot.sendMessage(chat.id, choosefoodtoedit_text, {
                                reply_markup: {
                                    inline_keyboard: keyboard
                                }
                            })
                        }
                    }
                }
                if (lastbuttons_amount === 0){
                    console.log('Клаву создали, отправляем сообщение с клавиатурой' + keyboard[line_amount])
                            bot.sendMessage(chat.id, choosefoodtoedit_text, {
                                reply_markup: {
                                    inline_keyboard: keyboard
                                }
                            })
                }
            }
            if (line_amount === 1){
                keyboard[1] = []
                console.log('Закончили создавать 4-х клавишные ряды. Создаем последний ряд')
                    for (let b = 1; b < lastbuttons_amount+1; b++){
                        if (line_amount > 1) {
                            keyboard[1].push({
                                text: (4 + b).toString() ,
                                callback_data: (4 + b).toString() 
                            })
                        }
                        if (line_amount <= 1) {
                            keyboard[1].push({
                                text: b.toString() ,
                                callback_data: b.toString() 
                            })
                        }
                        if (b === lastbuttons_amount){
                            console.log('Клаву создали, отправляем сообщение с клавиатурой' + b + ' ' + keyboard[0] + ' ' + keyboard[1])
                            bot.sendMessage(chat.id, choosefoodtoedit_text, {
                                reply_markup: {
                                    inline_keyboard: keyboard
                                }
                            })
                        }
                    }
            }
            
        })
    }

    for (let i = 0; i < 100; i++){
        if (query.data === (i+1).toString()){
            temp_backet_food = i
            console.log('pressed button is: ' + i)
            bot.editMessageText(chooseamountoffood_text + basket[i][1] + ' x ' + temp_food_price + 'тг. = ' + (basket[i][1] * temp_food_price + 'тг.'), {
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount2
                        },
                        {
                            text: increase_foodcount,
                            callback_data: increase_foodcount2
                        }],
                        [{
                            text: delete_basketfood,
                            callback_data: delete_basketfood
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text3
                        }]
                    ]
                }
            }).then(() => {
                bot.deleteMessage(chat.id, message_id - 1)
            })
        }
        //console.log('we dont have data with number: ' + i)
    }

    if (query.data === delete_basketfood) {
        //const index = basket.indexOf(temp_backet_food)
        let basket2 = basket
        console.log('!!!!   '  + temp_backet_food)
        
        for (let i = 0; i < basket.length; i++){
            //пока не нашли элемент для удаления, можно ничего не делать
            /*if (i < temp_backet_food){
                basket[i] = basket2[i]
            }*/
            if (i >= temp_backet_food){
                if (basket2[i+1] !== undefined){
                    console.log('BASKET2: ' + basket2[i+1])
                    basket[i] = basket2[i+1]
                }
                else {
                    //удаляем последний элемент нашего массива
                    console.log('BASKET22: ' + basket2[i+1])
                    basket.splice(i, 1)
                }
                
            }
        }
        bot.deleteMessage(chat.id, message_id).then(() => {
            if (basket.length > 0){
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket.length; i++){
                    finalsum += (basket[i][2] * basket[i][1])
                    if (i === basket.length - 1){
                        editmsg += finalsum + 'тг.'
                        console.log(finalsum + ' ' + i)
                        for (let i = 0; i < basket.length; i++){
                            console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                            editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                            if (i === basket.length - 1){
                                console.log('2Блюдо: ')
                                bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        keyboard: [
                                            [{
                                                text: mybasket_text
                                            }],
                                            [{
                                                text: paybasket_text
                                            }],
                                            [{
                                                text: anotherpoint_text
                                            }]
                                        ],
                                        resize_keyboard: true
    
                                    }
                                }).then(() => {
                                    bot.sendMessage(chat.id,  editmsg , {
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: anotherfood_text2,
                                                    callback_data: anotherfood_text2
                                                }],
                                                [{
                                                    text: editbasket_text,
                                                    callback_data: editbasket_text
                                                }]
                                            ]
                                        }
                                    })
                                })
    
                            }
                        }
                    }
                }
            }
            else {
                bot.sendMessage(chat.id,  basketisempty_text, {
                    reply_markup:{
                        inline_keyboard: [
                            [{
                                text: anotherfood_text2,
                                callback_data: anotherfood_text2
                            }]
                        ]
                    }
                })
            }
        })
    }

    if (query.data === addto_basket_text3) {
        bot.deleteMessage(chat.id, message_id).then(() => {
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket.length; i++){
                finalsum += (basket[i][2] * basket[i][1])
                if (i === basket.length - 1){
                    editmsg += finalsum + 'тг.'
                    console.log(finalsum + ' ' + i)
                    for (let i = 0; i < basket.length; i++){
                        console.log('1Блюдо: ' + basket[i][0] + '. Цена: ' + basket[i][2] + ' х ' + basket[i][1] + ' = ' + (basket[i][1] * basket[i][2]))
                        editmsg += `
` + (i+1) + `. ` + basket[i][0] + `. Цена: ` + basket[i][2] + `тг. х ` + basket[i][1] + ` = ` + (basket[i][1] * basket[i][2]) + `тг.`
                        if (i === basket.length - 1){
                            console.log('2Блюдо: ')
                            bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    keyboard: [
                                        [{
                                            text: mybasket_text
                                        }],
                                        [{
                                            text: paybasket_text
                                        }],
                                        [{
                                            text: anotherpoint_text
                                        }]
                                    ],
                                    resize_keyboard: true

                                }
                            }).then(() => {
                                bot.sendMessage(chat.id,  editmsg , {
                                    reply_markup:{
                                        inline_keyboard: [
                                            [{
                                                text: anotherfood_text2,
                                                callback_data: anotherfood_text2
                                            }],
                                            [{
                                                text: editbasket_text,
                                                callback_data: editbasket_text
                                            }]
                                        ]
                                    }
                                })
                            })

                        }
                    }
                }
            }
            
        })
    }

    for (let i = 0; i < times.length; i++){
        if (query.data === times[i] + ' минут'){
            finaltime_deelay = parseInt(query.data) 
            bot.deleteMessage(chat.id, message_id).then(() => {
                bot.sendMessage(chat.id, `Отлично! заказ будет готов через <b>` + finaltime_deelay + ` минут </b> после оплаты 😊`, {
                    parse_mode: 'HTML',
                    reply_markup:{
                        inline_keyboard: [
                            [{
                                text: paybutton_text,
                                callback_data: paybutton_text,
                            }],
                            [{
                                text: chooseanothertime_text,
                                callback_data: chooseanothertime_text
                            }],
                        ]
                    }
                })
            })
        }
    }

    if (query.data === chooseanothertime_text){
        finaltime_deelay = 0
        bot.deleteMessage(chat.id, message_id).then(() => {
            bot.sendMessage(chat.id, choosetime_text, {
                reply_markup:{
                    inline_keyboard: [
                        [{
                            text: times[0].toString() + ' минут',
                            callback_data: times[0].toString() + ' минут'
                        },
                        {
                            text: times[1].toString() + ' минут',
                            callback_data: times[1].toString() + ' минут'
                        },
                        {
                            text: times[2].toString() + ' минут',
                            callback_data: times[2].toString() + ' минут'
                        },
                    ]
                    ]
                }
            })
        })
        
    }
    
    if (query.data === paybutton_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }).then(() => {
            bot.sendInvoice(
                chat.id, 
                'Оплата заказа ' + chat.username,
                finalbasket + `
Заберу через ` + finaltime_deelay + ` минут после оплаты`,
                'payload',
                '410694247:TEST:38d2953c-db26-49b8-9b7e-f7661917eb89',
                'RANDOM_KEY',
                'KZT',
                [{
                    label: 'Оплата заказа ' + chat.username,
                    amount: finalprice * 100,
                }],
                {
                    need_name: true,
                    need_phone_number: true,
                    is_flexible: false,
                    max_tip_amount: 10000000,
                    suggested_tip_amounts: JSON.stringify([10000, 50000, 100000], null, 0)
                }
            )
        })
        
    }

    if (query.data === yesigotorder_text){
        for(let i = 0; i < 100; i++){
            if (i <= 98){
                bot.deleteMessage(chat.id, message_id - i - 1).catch(err => {
                    console.log('Очистка закончена: ' + err)
                })
            }
            if (i === 99){
                bot.deleteMessage(chat.id, message_id - i - 1).catch(err => {
                    console.log('Очистка закончена: ' + err)
                }).then(() => {
                    bot.sendMessage(chat.id, whereareyoufrom_text,
                        {
                                reply_markup:{
                                    inline_keyboard:[
                                        [{
                                            text: 'Нур-Султан',
                                            callback_data: 'Нур-Султан'
                                        }]/*,
                                        [{
                                            text: 'Алматы',
                                            callback_data: 'Алматы'
                                        }]*/
                                    ]
                                }
                        })
                })
                
            }
        }
        
    }
})

function GetPoints_NurSultan() {
    //получаем инфу о том, сколько заведений есть в этом городе
    let points_amount = 0
    var points_data = fb.database().ref('cities/0/points_number')
    points_data.on('value', (snapshot) => {
        points_amount = snapshot.val() - 1 //оператор в firebase пишет число заведений, а мы начинаем счет с 0
        console.log('points: ' + points_amount)
        if (snapshot.exists()){
            //получаем инфу о том, как они называются (их адреса)
            for (let i = 0; i < points_amount + 1; i++){
                //узнаем названия(адреса) заведений
                let address_data = fb.database().ref('cities/0/points/' + i + '/point_name')
                address_data.on('value', (snapshot) => {
                    NurSultan_adresses[i] = snapshot.val()
                    console.log('Adress #' + i + ' = ' + NurSultan_adresses[i])
                    if (i === points_amount && snapshot.exists()){
                        console.log('points: ' + points_amount)
                        CreateNurSultanKeyBoard(points_amount)
                    }
                })

                //узнаем latitude заведений
                let latitude_data = fb.database().ref('cities/0/points/' + i + '/latitude')
                latitude_data.on('value', (snapshot) => {
                    NurSultan_geo1[i] = snapshot.val()
                    console.log('latitude #' + i + ' = ' + NurSultan_geo1[i])
                })

                //узнаем longitude заведений
                let longitude_data = fb.database().ref('cities/0/points/' + i + '/longitude')
                longitude_data.on('value', (snapshot) => {
                    NurSultan_geo2[i] = snapshot.val()
                    console.log('longitude #' + i + ' = ' + NurSultan_geo2[i])
                })
            }
        }
    })
}

function CreateNurSultanKeyBoard(points_amount){
    NurSultan_keyboard = []
    //создаем из этих данных клавиатуру (массив)
    NurSultan_keyboard[0] = [{      //первая кнопка всегда "Отправить свою локацию"
        text: sendlocation,
        callback_data: sendlocation
    }, {
        text: choosecity_text,
        callback_data: choosecity_text
    }]
    let minuser = 0                  //+0
    console.log('points_amount: ' + points_amount)
    points_amount++
    for (let i = 1; i < points_amount + 1; i=i+2){
        console.log('func: ' + i)
        if (i === points_amount){
            console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + NurSultan_adresses[i-1])
            NurSultan_keyboard[i-minuser] = [{
                text: NurSultan_adresses[i-1],
                callback_data: NurSultan_adresses[i-1]
            }]
        }
        else {
            console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + NurSultan_adresses[i-1] + '. Вторая кнопка: ' + NurSultan_adresses[i])
            NurSultan_keyboard[i - minuser] = [{
                text: NurSultan_adresses[i-1],
                callback_data: NurSultan_adresses[i-1]
            },
            {
                text: NurSultan_adresses[i],
                callback_data: NurSultan_adresses[i]
            }]

            minuser++
        }
    }
}

function GetPoints_Almaty() {
    //получаем инфу о том, сколько заведений есть в этом городе
    let points_amount = 0
    var points_data = fb.database().ref('cities/1/points_number')
    points_data.on('value', (snapshot) => {
        points_amount = snapshot.val() - 1 //оператор в firebase пишет число заведений, а мы начинаем счет с 0
        console.log('points: ' + points_amount)
        if (snapshot.exists()){
            //получаем инфу о том, как они называются (их адреса)
            for (let i = 0; i < points_amount + 1; i++){
                let address_data = fb.database().ref('cities/1/points/' + i + '/point_name')
                address_data.on('value', (snapshot) => {
                    Almaty_adresses[i] = snapshot.val()
                    console.log('Adress #' + i + ' = ' + Almaty_adresses[i])
                    if (i === points_amount && snapshot.exists()){
                        console.log('points: ' + points_amount)
                        CreateAlmatyKeyBoard(points_amount)
                    }
                })
            }
        }
    })
}

function CreateAlmatyKeyBoard(points_amount){
    Almaty_keyboard = []
    //создаем из этих данных клавиатуру (массив)
    Almaty_keyboard[0] = [{      //первая кнопка всегда "Отправить свою локацию"
        text: sendlocation,
        callback_data: sendlocation
    }, {
        text: choosecity_text,
        callback_data: choosecity_text
    }]
    let minuser = 0
    console.log('points_amount: ' + points_amount)
    points_amount++
    for (let i = 1; i < points_amount + 1; i=i+2){
        console.log('func: ' + i)
        if (i === points_amount){
            //console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + NurSultan_adresses[i-1])
            Almaty_keyboard[i-minuser] = [{
                text: Almaty_adresses[i-1],
                callback_data: Almaty_adresses[i-1]
            }]
        }
        else {
            //console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + NurSultan_adresses[i-1] + '. Вторая кнопка: ' + NurSultan_adresses[i])
            Almaty_keyboard[i - minuser] = [{
                text: Almaty_adresses[i-1],
                callback_data: Almaty_adresses[i-1]
            },
                {
                    text: Almaty_adresses[i],
                    callback_data: Almaty_adresses[i]
                }]

            minuser++
        }
    }
}

bot.onText(/Admin_controller:GetChatInfo/, msg =>
{
    //console.log(msg)
    const chatId = msg.chat.id
    bot.sendMessage(chatId, chatId)

})
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id
    for (let i=0; i<100; i++){
        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
            console.log(err)
        })
    }
    bot.sendMessage(chatId, whereareyoufrom_text,
        {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Нур-Султан',
                        callback_data: 'Нур-Султан'
                    }]/*,
                    [{
                        text: 'Алматы',
                        callback_data: 'Алматы'
                    }]*/
                ]
            }
        })
})

bot.onText(/\/point/, msg => {
    const chatId = msg.chat.id
    for (let i=0; i<100; i++){
        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
            console.log(err)
        })
    }
    if (userCity === 0){
        const textmsg = `Вы выбрали <b>Нур-Султан</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
        bot.sendMessage(chatId,textmsg,
            {
                parse_mode: 'HTML',
                reply_markup:{
                    inline_keyboard: NurSultan_keyboard
                }
            })
    }

    if (userCity === 1){
        const textmsg = `Вы выбрали <b>Алматы</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
        bot.sendMessage(chatId,textmsg,
            {
                parse_mode: 'HTML',
                reply_markup:{
                    inline_keyboard:Almaty_keyboard
                }
            })
    }
})

