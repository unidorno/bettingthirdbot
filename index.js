const TelegramBot = require('node-telegram-bot-api')
//const mongoose = require('mongoose')
var GeoPoint = require('geopoint')
const debug = require('./helpers')
const config = require('./config')
const database = require('./database.json')
const keyboards = require('./src/keyboard-buttons')
const NodeGeocoder = require('node-geocoder');
//const firebase = require('./firebase_connect')
console.log('bot has been started...')


//====================INITIALIZE FIREBASE==============================
const firebase_connect = require('firebase')

const fb = firebase_connect.initializeApp({
    apiKey:'AIzaSyBiSZeKCsZHwFotMb358IrEiYZYvBbRhhg',
    authDomain:'emptytest-157e6.firebaseapp.com',
    databaseURL: 'https://emptytest-157e6.firebaseio.com/'
})

//====================================================================

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
let admin_id = 0
let delivery_chat = 0
let current_chat = 0

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
let restaurant_name = 'Coffee BOOM'
const hellomessage_text = `Привет! Я бот ресторана ` + restaurant_name + `. С моей помощью Вы можете заказывать еду и узнавать о новых акциях 🛍`
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
const paybasket_text = '✅ Сделать заказ'
const youwanttochangepoint_text = 'Вы точно хотите сделать предзаказ в другом заведении? При смене заведения придется выбирать блюда снова'
const query_deletethismessage = 'Нет, не хочу'
const choosefoodtoedit_text = 'Выберите номер блюда, которое нужно отредактировать:'
const delete_basketfood = '🗑  Удалить'
const basketisempty_text = 'Теперь корзина пустая. Давай наполним ее 😏'
const mybasket_text = '🛒 Моя корзина'
const myorder_text = '🧾 Мой заказ'
const choosetime_text = 'Через сколько минут Вы хотите получить заказ? (мин. 15 мин)'
const chooseanothertime_text = '⏳ Выбрать другое время'
const paybutton_text = '💳 Оплатить'
const location_text = '📍 Где мы находимся?'
const phone_text = '📞 Позвонить нам'
const didyougetorder_text = 'Вы точно получили свой заказ? Данные о заказе могут не сохраниться'
const yesigotorder_text = 'Да, заказ получен'
const noigotorder_text = 'Я еще не забрал заказ'
const almostthere_text = '🤗 Почти готово! Осталось только указать свой номер и адрес доставки. При необходимости курьер позвонит Вам и уточнит детали'
const dataiscorrect_text = '✔️ Продолжить'
const order_status_button = '🚴‍♂️ Статус заказа'
const coins_text = '💰 Мой баланс'
const finish_order_text = '✔️ Завершить'
const add_email = '🔗 Добавить email'
const dont_add_email = 'Нет, спасибо'
const spendmycoins = 'Да, хочу'
const dontspendmycoins = 'Нет'
let help_phone = '+77077777777'
const didntaddemail_text = '😕 Жаль, что вы не хотите указать свой email. Это еще одна возможность быть в курсе акций и уникальных предложений'
const emailalreadyadded_text = 'Спасибо за то, что выбираете нас! Вы можете сделать еще один заказ: '
/////////////////////////////////////////////////////////////////
const sticker_hello = 'CAACAgIAAxkBAAMPYLD3oI-JToPQK3oid4_X8irtMrQAAlQAA0G1Vgxqt_jHCI0B-h8E'

/////////////////////////////////////////////////////////////////
let basket = [] //корзина (массив массивов)
let decrease_foodcount = '-'
let increase_foodcount = '+'
let decrease_foodcount2 = '.-.'
let increase_foodcount2 = '.+.'
let temp_foodamount = 1
let food_categories = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
let temp_food_price = 0
let temp_food_text = ''
let temp_backet_food = 0
let finalbasket = ''
let finalprice = 0
let finaltime_deelay = ''
let finaltime = new Date()

///////////Настройки для системы лояльности///////////
let cashback = 0
let max_pay_percentage = 0
let min_pay_percentage = 0
let percent_foremail = 0
let skidka = 0

///////////Настройки для рассылки///////////
let cheap_max = 0
let group_buys_amount = 0
let reach_min = 0

///////////////Данные о пользователе//////////////////
let user_phone = ''
let user_email = ''
let user_adress = ''
let user_name = ''
let user_username = 'unknown'
let user_id = 0
let average_price = 0
let average_purchases = 0
let user_coins = 0
let added_coins = 0
let favourite_food = 'unknown'
let alltime_purchases_amount = 0
let userstatus = 'unknown'
let order_name = ''
let order_date = ''
let order_status = 'unknown'
let order_statuses_text = ['В обработке ⏳', '🚴‍♂️ Доставляется', '✅ Доставлен', '❌ Отклонен']
///////////////////////////////////////////////////////

//////////////////QUERY USER DATA//////////////////////
const changename_text = 'Изменить имя'
const changephone_text = 'Изменить номер'
const changeadress_text = 'Изменить адрес'
let isMakingChanges = 0
///////////////////////////////////////////////////////

let Point_location = []
let point_adress = ''
const delivery_started = '✅ Заказ отправлен! Через несколько минут его увидит курьер и приступит к доставке. Мы уведомим Вас об изменении статуса вашего заказа.'

var userlocation = [0.1,0.1]
var nearest_place = 0 //номер ближайшего заведения(в массиве)
var min_distance = 9999999

//////////////////DATA FOR DELIVERS//////////////////////
let delivers_bill = ''
let deliver_bill_topic = ''
let deliver_bill_topic_names = ['🎉 Новый заказ!', '⚙️ Заказ принят. Статус: ', '❌ Заказ отклонен работником: ']
let deliver_bill_client_info = ''
let deliver_bill_order_info = ''
let deliver_bill_finalprice = 0
let deliver_bill_order_details = ''
let accepted_order_name = ''
let accept_order_callback = 'acc_n'
let refuse_order_callback = 'ref_n'
let isdelivered_callback = 'del_c'
let deliver_bill_messageids = []
///////////////////////////////////////////////////////

let unregistered_keyboard = []
unregistered_keyboard[0] = [
    [{
        text: mybasket_text
    }],
    [{
        text: paybasket_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]
unregistered_keyboard[1] = [
    [{
        text: finish_order_text
    },{
        text: myorder_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]
unregistered_keyboard[2] = [
    [{
        text: order_status_button
    },{
        text: myorder_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]

let registered_keyboard = []
registered_keyboard[0] = [
    [{
        text: mybasket_text
    }],
    [{
        text: paybasket_text
    },{
        text: coins_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]

function StartCheckingOrder(){
    let order_data = fb.database().ref(order_name)
    order_data.on('value', (result) => 
    {
        order_status = result.val().order_status
        console.log('ORDER STATUS: ' + result.val().order_status + ', name: "' + order_name + '"')

        if (order_status === order_statuses_text[3]){
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(current_chat, 'Нам жаль, но мы были вынуждены отклонить Ваш заказ. Вы можете связаться с нами, нажав на кнопку ' + phone_text)
        }
        
        if (order_status === order_statuses_text[2]){
            //мы получили заказ. На клаве вместо статус заказа поставить "заказ получен". Также написать сообщение мол ваш заказ был успешно доставлен. Нажмите на кнопку "готово", чтобы получить баллы или заказать еще раз. 
            //После нажатия на кнопку готово, мы очищаем все данные связывающие аккаунт с чеком доставки, чтобы если в чате доставщиков поменяют статус, клиент не получал опевещений. 
            
            const temp_text = `✅ Ваш заказ был успешно доставлен! 
            
Для завершение заказа <b> нажмите кнопку "` + finish_order_text + `". </b>

Если вы столкнулись с проблемой при заказе, нажмите на кнопку "` + phone_text + `". Мы будем рады помочь.`
            
            bot.sendMessage(current_chat, temp_text, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: unregistered_keyboard[1],
                    resize_keyboard: true

                }
            })
        
        }

        if (order_status === order_statuses_text[1]){
            //в этом случае выводить клавиатуру как после успешного заказа. Вдруг кто-то по ошибке нажмет что заказ доставлен. Тогда клиент звонит в кафе и после разговора статус снова меняют на "доставляется" и продолжают работать. 
            bot.sendMessage(current_chat, 'Статус заказа изменен на "' +  order_status + '".') 
        }
    }
)
}



var other_data = fb.database().ref('Delivery/other_info')
    other_data.on('value', (snapshot) => 
    {
        help_phone = snapshot.val().contact_phone
        Point_location[0] = snapshot.val().latitude
        Point_location[1] = snapshot.val().longitude
        point_adress = snapshot.val().adress_text
        console.log('!! ' + help_phone + ' ' + point_adress + ' ' + Point_location[0] + ' ' + Point_location[1])
    }
)

var loyalsys_data = fb.database().ref('Delivery/loyal_system/preferences')
loyalsys_data.on('value', (snapshot) => 
    {
        cashback = snapshot.val().percentage
        max_pay_percentage = snapshot.val().max_pay_percentage
        min_pay_percentage = snapshot.val().min_pay_percentage
        percent_foremail = snapshot.val().percent_foremail
    }
)

var mailing_data = fb.database().ref('Delivery/mailing/preferences')
    mailing_data.on('value', (snapshot) => 
    {
        reach_min = snapshot.val().reach_min
        group_buys_amount = snapshot.val().group_buys_amount
        cheap_max = snapshot.val().cheap_max
    }
)

var chats_data = fb.database().ref('Delivery/chats')
    chats_data.on('value', (snapshot) => 
    {
        admin_id = snapshot.val().admin
        delivery_chat = snapshot.val().delivery_chat
        console.log('!!! ' + admin_id + ' ' + delivery_chat)
    }
)

function CheckUser(userid, username, chatId){
    console.log('checking user: ' + userid + ' ' + username)
    let userdata = fb.database().ref('Delivery/clients/' + userid)
    userdata.get().then((result) => 
    {
        console.log('Пользователь зарегистрирован. ID: ' + userid + ' ' + result.val().id)
        user_adress = result.val().adress
        user_email = result.val().email
        user_name = result.val().name
        user_username = result.val().username
        user_phone = result.val().phone
        user_id = result.val().id
        alltime_purchases_amount = result.val().alltime_purchases_amount
        user_coins = result.val().coins

        userstatus = 'registered'

        bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Имя: ' + user_name,
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' + user_phone,
                        callback_data: changephone_text
                    }],
                    [{
                        text: 'Адрес: ' + user_adress,
                        callback_data: changeadress_text
                    }],
                    [{
                        text: dataiscorrect_text,
                        callback_data: dataiscorrect_text
                    }]
                ]
            }
        })

        StartAnalitycs()

    }).catch(error => {
        console.log('Пользователь не зарегистрирован. ' + error)
        userstatus = 'unregistered'
        /*fb.database().ref('Delivery/clients/').set({
            userid : {
                adress: 'unknown'
            }
            username: name,
            email: email,
            profile_picture : imageUrl
          });*/
        user_name = username
          bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Имя: ' + user_name,
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' + user_phone,
                        callback_data: changephone_text
                    }],
                    [{
                        text: 'Адрес: ' + user_adress,
                        callback_data: changeadress_text
                    }]
                ]
            }
        })

        StartAnalitycs()
    })
}

function StartAnalitycs(){
    
    //узнаем любимую еду пользователя
    for (let i = 0; i < basket.length; i++){
        if (basket[i][3] === 0){
            //тут идут завтраки, а значит попадает в категорию "основное"
            food_categories[5][1] = food_categories[5][1] + basket[i][1]
            console.log('Добавляем в категорию "основное" очки. Основного теперь: ' + food_categories[5][1])
        }
        if (basket[i][3] === 1){
            //тут идут десерты, значит попадает в "десерты"
            food_categories[3][1] = food_categories[3][1] + basket[i][1]
            console.log('Добавляем в категорию "десерты" очки. Десертов теперь: ' + food_categories[3][1])
        }
        if (i === basket.length - 1){
            //все распределили, теперь узнаем какую еду любим
            console.log('Баллы определили. Теперь выбираем любимую еду')
            let favourite_food_number = 0
            for (let i = 0; i < food_categories.length; i++){
                if (i <= food_categories.length - 1){
                    console.log('Сравниваем категорию #' + i + ' и #' + (i+1))
                    /* if (food_categories[i][1] >= food_categories[i+1][1]){
                        favourite_food = food_categories[i][0]
                        console.log(i +' 1 Категория ' + food_categories[i][0] + ' больше, чем категория ' + food_categories[i+1][0])
                    }
                    else if (food_categories[i][1] < food_categories[i+1][1]){
                        favourite_food = food_categories[i+1][0]
                        console.log(i + ' 2 Категория ' + food_categories[i+1][0] + ' больше, чем категория ' + food_categories[i][0])
                    }*/
                    if (food_categories[i][1] >= favourite_food_number){
                        favourite_food = food_categories[i][2]
                        favourite_food_number = food_categories[i][1]
                        console.log(i +' 1 Категория ' + food_categories[i][0] + ' больше')
                    }
                    if (i === food_categories.length - 1){
                        console.log('WINNER: ' + favourite_food)
                    } 

                }
            }
        }
    }

    //узаем средний чек пользователя
    if (average_price === 0){
        console.log('1 finalprice is ' + finalprice)
        average_price = finalprice
    }
    if (average_price !== 0){
        console.log('2 finalprice is ' + finalprice)
        average_price = (average_price + finalprice) / 2
        console.log('2 average price is ' + average_price)
    }

    //узнаем среднее число заказываемых за раз блюд
    if (average_purchases === 0){
        for (let i = 0; i < basket.length; i++){
            average_purchases += basket[i][1]
            if (i === basket - 1){
                console.log('1 purchases amount = ' + average_purchases)
            }
        }
    }
    if (average_purchases !== 0){
        let temp_purchases = 0
        for (let i = 0; i < basket.length; i++){
            temp_purchases += basket[i][1]
            if (i === basket - 1){
                console.log('2 old purchases amount = ' + average_purchases)
                console.log('2 new purchases amount = ' + temp_purchases)
                average_purchases = (average_purchases + temp_purchases) / 2
                console.log('2 final purchases amount = ' + average_purchases)
            }
        }
    }
}

function AddMailingData(){

    if (finalprice >= reach_min){
        console.log('!? reach_min: ' + reach_min)
        let userdata = fb.database().ref('Delivery/mailing/categories/reach')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                if (user_ids[i] === current_chat.toString()){
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                    let updates = {}
                    updates['Delivery/mailing/categories/reach/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + current_chat
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += current_chat
                    }

                    updates['Delivery/mailing/categories/reach/user_ids'] = user_ids_string

                    fb.database().ref().update(updates)
                }
            }
           
        })
    }

    if (finalprice <= cheap_max){
        let userdata = fb.database().ref('Delivery/mailing/categories/cheap')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                if (user_ids[i] === current_chat.toString()){
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                    let updates = {}
                    updates['Delivery/mailing/categories/cheap/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + current_chat
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += current_chat
                    }
                    
                    updates['Delivery/mailing/categories/cheap/user_ids'] = user_ids_string
                    
                    fb.database().ref().update(updates)
                }
            }
           
        })
    }

    for (let i = 0; i < food_categories.length; i++){
        if (favourite_food === food_categories[i][2]){
            console.log('!!! Delivery/mailing/categories/' + food_categories[i][2])
            let userdata = fb.database().ref('Delivery/mailing/categories/' + food_categories[i][2])
            userdata.get().then((result) => 
            {
                let count = result.val().user_amount
                count++
                let user_ids_string = ''
                user_ids_string = result.val().user_ids
                let user_ids = user_ids_string.split(',')
                
                for (let i = 0; i < user_ids.length; i++){
                    console.log('category user ids list: ' + user_ids[i] + ' ' + current_chat)
                    if (user_ids[i] === current_chat.toString()){
                        console.log('found user_id. BREAK! ' + user_ids[i] + ' ' + current_chat)
                        break
                    }
                    if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                        console.log('users length = ' + user_ids.length + ', i =' + i)
                        let updates = {}
                        updates['Delivery/mailing/categories/' + favourite_food + '/user_amount'] = count

                        if (user_ids_string !== ''){
                            user_ids_string += ',' + current_chat
                        }
    
                        else if (user_ids_string === ''){
                            user_ids_string += current_chat
                        }

                        updates['Delivery/mailing/categories/' + favourite_food + '/user_ids'] = user_ids_string
                        
                        fb.database().ref().update(updates)
                    }
                }
            })

            
            
        }
    }

        let userdata = fb.database().ref('Delivery/mailing/all')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                console.log('all, user ids list: ' + user_ids[i] + ' ' + current_chat)
                if (user_ids[i] === current_chat.toString()){
                    console.log('found user_id. BREAK! "' + user_ids[i] + '" "' + current_chat + '"')
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                    console.log('users length = "' + user_ids.length + '", i = "' + i + '". (user_ids[i] !== current_chat): ' + user_ids[i] + ' !== ' + current_chat)
                    let updates = {}
                    updates['Delivery/mailing/all/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + current_chat
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += current_chat
                    }

                    updates['Delivery/mailing/all/user_ids'] = user_ids_string

                    fb.database().ref().update(updates)
                }
            }
           
        })
}

bot.on("polling_error", console.log);

bot.on('pre_checkout_query', pre_checkout_query => {
    bot.answerPreCheckoutQuery( pre_checkout_query.id, true, {
        error_message: 'При оплате произошла ошибка. Попробуйте повторить действие позже'
    })

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

    console.log(msg)

    if (msg.text === coins_text){
        /* bot.editMessageText(msg.text, {
            chat_id: chatId,
            message_id: msg.message_id - 1
        }).then(() => {
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
            })
        }) */

        bot.deleteMessage(chatId, msg.message_id).then(() => {
            bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
        })
    }

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

    if (msg.text === myorder_text){

        //bot.deleteMessage(chatId, msg.message_id-1)
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
                                        if (skidka !== 0) {
                                            editmsg += `

Цена с учетом скидки: ` + finalprice + ' тенге.'
                                        }
                                        if (i === basket.length - 1){
                                        bot.sendMessage(chatId,  editmsg)
                                    }
                                }
                            }
            }
        })
        
    }

    if (msg.text === paybasket_text){
        finaltime_deelay = 0
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
                                            CheckUser(msg.chat.id, msg.chat.first_name, chatId)
                                        })
            
                                    }
                                }
                            }
            }
        })
    }

    if (msg.text === location_text){
        bot.sendLocation(chatId, Point_location[0], Point_location[1]).then(() => {
            bot.sendMessage(chatId, '📍 Мы находимся по адресу: ' + point_adress)
        })
        
    }
    if (msg.text === phone_text){
        bot.sendContact(chatId, help_phone, restaurant_name)
    }

    if (isMakingChanges !== 0){
        if (isMakingChanges === 1){
            isMakingChanges = 0
            user_name = msg.text
        }

        if (isMakingChanges === 2){
            isMakingChanges = 0
            user_phone = msg.text
        }

        if (isMakingChanges === 3){
            isMakingChanges = 0
            user_adress = msg.text
        }

        if (isMakingChanges === 4){
            isMakingChanges = 0
            user_email = msg.text
            user_coins = user_coins + (added_coins * percent_foremail)
            //тут возвращаем пользователя на главную, но уже регистеред

            let updates = {};
            updates['Delivery/clients/' + msg.chat.id + '/email'] = user_email
            updates['Delivery/clients/' + msg.chat.id + '/coins'] = user_coins
            fb.database().ref().update(updates).then(() => {
                //тут отправить в главное меню
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        console.log(err)
                    })
                }
                bot.sendMessage(chatId, 'Ура! Email подтвержден. Вам было зачислено ' + (added_coins * percent_foremail) + ' тенге. Ваш баланс: ' + user_coins + ' тенге').then(() => {
                    anotherpoint_multiple = 2
                    keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                })
            })
        }

        if (user_adress !== '' && user_phone !== '' && user_name !== ''){
            //order_status = order_statuses_text[0]
            console.log('LOL ' + msg.message_id + ', ' + (msg.message_id - 1))
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                console.log('LOL2 ' + msg.message_id + ', ' + (msg.message_id - 1))
            })
            bot.editMessageText(almostthere_text, {
                chat_id: chatId,
                message_id: msg.message_id - 2,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Имя: ' + user_name,
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone,
                            callback_data: changephone_text
                        }],
                        [{
                            text: 'Адрес: ' + user_adress,
                            callback_data: changeadress_text
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect_text
                        }]
                    ]
                }
            }
            ).catch(err => {
                console.log('err ' + err)
            })
            
        }
        if (user_adress === '' || user_phone === '' || user_name === '')
        {
            console.log('LOL3 ' + msg.message_id + ', ' + (msg.message_id - 1))
            bot.deleteMessage(chatId, msg.message_id)
            bot.editMessageText(almostthere_text, {
                chat_id: chatId,
                message_id: msg.message_id - 1,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Имя: ' + user_name,
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone,
                            callback_data: changephone_text
                        }],
                        [{
                            text: 'Адрес: ' + user_adress,
                            callback_data: changeadress_text
                        }]
                    ]
                }
            }
            )
        }
    }

    if (msg.text === order_status_button){
        bot.deleteMessage(msg.chat.id, msg.message_id).then(() => {
            console.log('Order name: "' + order_name + '"')
            let userdata = fb.database().ref(order_name)
            userdata.get().then((result) => {
                order_status = result.val().order_status
                console.log('order_status: ' + result.val().order_status)
                console.log('order link: Delivery/bills/' + order_name)
                bot.sendMessage(msg.chat.id, 'Статус вашего заказа: ' + order_status)
            }) 
        })
    }

    if (msg.text === finish_order_text){
        bot.deleteMessage(chatId, msg.message_id - 1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {

            user_coins = user_coins + (finalprice * cashback)
            added_coins = (finalprice * cashback)
            console.log('coins = '+ user_coins + '. Было начислено ' + added_coins)

            order_status = 'unknown'
            order_name = ''
            finalbasket = ''
            finalprice = 0
            basket = []

            if (user_email === 'unknown'){
                
                let tmp_text = `Вам было зачислено <b>` + added_coins + `</b> тенге. Ваш счет: ` + user_coins + ` тенге. Ими можно оплачивать следующие заказы. 
                
Кстати, если Вы привяжете к этому аккаунту свой email, то получите еще <b>` + (added_coins * percent_foremail) + `</b> тенге. 

Не волнуйтесь, мы не будем слать Вам спам 😏 `
                bot.sendMessage(chatId, tmp_text, {
                    parse_mode: 'HTML',
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: add_email,
                                callback_data: add_email
                            }],
                            [{
                                text: dont_add_email,
                                callback_data: dont_add_email
                            }]
                        ]
                    }
                })
            }

            else if (user_email !== 'unknown'){
                let updates = {};
                updates['Delivery/clients/' + msg.chat.id + '/coins'] = user_coins
                fb.database().ref().update(updates).then(() => {
                    //тут отправить в главное меню
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                            console.log(err)
                        })
                    }
                    bot.sendMessage(chatId, 'Теперь ваш баланс: ' + user_coins + '. ' + emailalreadyadded_text).then(() => {
                        anotherpoint_multiple = 2
                        keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                    })
                })
            }
        })
    }

    if (msg.text === dont_add_email){
        isMakingChanges = 0
        //теперь можно совершать новые покупки, но ты регистеред

        let updates = {};
        updates['Delivery/clients/' + msg.chat.id + '/coins'] = user_coins
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chatId, didntaddemail_text).then(() => {
                anotherpoint_multiple = 2
                keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
            })
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
        bot.editMessageText(hellomessage_text,
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
        keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
    }

    for (let i = 0; i < userCategories.length; i++){

        if (query.data === userCategories[i]){
            userCategory = i
            keyboards.FoodKeyboard(foodlist_keyboard, userFoodlist, foodlist_count, userCategory, fb, bot, chat, message_id, anothercategory_text, query, choosefood_text)
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
                let food_photo = fb.database().ref('Delivery/ordering/categories/' + userCategory + '/food/' + i)
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

<b> 💰 Цена: </b>` + temp_food_price + ` тенге`
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
                let newfood = [userFoodlist[userFood], temp_foodamount, temp_food_price, userCategory]
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
                                    if (userstatus === 'registered'){
                                        bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                            parse_mode: 'HTML',
                                            reply_markup: {
                                                keyboard: registered_keyboard[0],
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
                                    if (userstatus === 'unregistered' || userstatus === 'unknown'){
                                        bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                            parse_mode: 'HTML',
                                            reply_markup: {
                                                keyboard: unregistered_keyboard[0],
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
                })
                break
            }
        }
        if (basket.length === 0){
            console.log('3')
            let newfood = [userFoodlist[userFood], temp_foodamount, temp_food_price, userCategory]
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
                                if (userstatus === 'registered'){
                                    bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: registered_keyboard[0],
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
                                
                                if (userstatus === 'unregistered' || userstatus === 'unknown'){
                                    bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: unregistered_keyboard[0],
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
                                if (userstatus === 'registered'){
                                    bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: registered_keyboard[0],
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
                                if (userstatus === 'unknown' || userstatus === 'unregistered'){
                                    bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: unregistered_keyboard[0],
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
                            if (userstatus === 'unknown' || userstatus === 'unregistered'){
                                bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        keyboard: unregistered_keyboard[0],
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
                            if (userstatus === 'registered'){
                                bot.sendMessage(chat.id, `<b>`+ basket[i][0] + `</b> добавлен в корзину`, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        keyboard: registered_keyboard[0],
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
                    bot.sendMessage(chat.id, hellomessage_text,
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

    if (query.data === changename_text){
        isMakingChanges = 1
        bot.editMessageText('🙂 Введите свое имя, так курьеру будет проще найти Вас:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }
    if (query.data === changephone_text){
        isMakingChanges = 2
        bot.editMessageText('📞 Введите свой номер, чтобы курьер мог связаться с Вами в случае необходимости:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }
    if (query.data === changeadress_text){
        isMakingChanges = 3
        bot.editMessageText('📍 Введите адрес доставки:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }
    if (query.data === dataiscorrect_text){
        if (userstatus !== 'unregistered' && user_coins >= (finalprice * min_pay_percentage)){
            if (user_coins <= (finalprice * max_pay_percentage)){
                //тут можно оплатить всеми баллами.
                skidka = user_coins
                bot.sendMessage(chat.id, 'У вас есть ' + user_coins + ' тенге, которыми можно оплатить заказ. Сумма заказа с учетом скидки: ' + finalprice + ' тенге. Хотите потратить их сейчас?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: spendmycoins,
                                callback_data: spendmycoins
                            },{
                                text: dontspendmycoins,
                                callback_data: dontspendmycoins
                            }]
                        ],
                    },
                })
            }
            else if (user_coins > (finalprice * max_pay_percentage)){
                //тут оплачиваем максимальным количеством баллов
                skidka = finalprice * max_pay_percentage
                bot.sendMessage(chat.id, 'Ваш баланс: ' + user_coins + ' тенге. Вы можете потратить ' + finalprice * max_pay_percentage + 'тенге на оплату заказа. Сумма заказа с учетом скидки: ' + (finalprice - ( finalprice * max_pay_percentage)) + ' тенге. Хотите сделать это?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: spendmycoins,
                                callback_data: spendmycoins
                            },{
                                text: dontspendmycoins,
                                callback_data: dontspendmycoins
                            }]
                        ],
                    },
                })
            }
        }
        else {
            bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[2],
                        resize_keyboard: true
    
                    }
                })

                let updates = {};

                let newuser = {
                    adress: user_adress,
                    average_price: average_price,
                    average_purchases: average_purchases,
                    coins: user_coins,
                    email: user_email,
                    favourite_food: favourite_food,
                    id: chat.id,
                    name: user_name,
                    phone: user_phone,
                    username: chat.username.toString(),
                    alltime_purchases_amount: alltime_purchases_amount + 1
                }

                let date_now = new Date()
                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name = 'Delivery/bills/' + date_now.toString()
                order_date = date_now.toString()
                console.log('ORDER NAME: ' + order_name)

                let newbill = {
                    date_ordered: order_date,
                    order_info: finalbasket,
                    price: finalprice,
                    client_id: chat.id,
                    phone: user_phone,
                    order_status: order_statuses_text[0],
                    adress: user_adress,
                    client_name: user_name
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name + `
├ Адрес: ` + user_adress + `
└ Номер: ` + user_phone + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + order_date + `

`
    console.log('order_date! ' + order_date)

    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone, user_name)
        /* let update = {}
        let bill_message_id = query.message.message_id
        console.log('bills message id: ' + bill_message_id)
        update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
        console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
    })

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
        }
        
    }

    if (query.data === spendmycoins){
        finalprice = finalprice - skidka
        user_coins -= skidka
        finalbasket += `

Цена с учетом скидки: ` + finalprice + ' тг.'

        bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[2],
                        resize_keyboard: true
    
                    }
                })

                let updates = {}

                let newuser = {
                    adress: user_adress,
                    average_price: average_price,
                    average_purchases: average_purchases,
                    coins: user_coins,
                    email: user_email,
                    favourite_food: favourite_food,
                    id: chat.id,
                    name: user_name,
                    phone: user_phone,
                    username: chat.username.toString(),
                    alltime_purchases_amount: alltime_purchases_amount + 1
                }

                let date_now = new Date()
                order_name = 'Delivery/bills/' + date_now.toString()
                order_date = date_now.toString()
                console.log('ORDER NAME: ' + order_name)

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: order_date,
                    order_info: finalbasket,
                    price: finalprice,
                    client_id: chat.id,
                    phone: user_phone,
                    order_status: order_statuses_text[0],
                    adress: user_adress,
                    client_name: user_name
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name + `
├ Адрес: ` + user_adress + `
└ Номер: ` + user_phone + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + order_date + `

`
    console.log('order_date! ' + order_date)
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone, user_name)
        /* let update = {}
        let bill_message_id = query.message.message_id
        console.log('bills message id: ' + bill_message_id)
        update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
        console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
    })

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
    }

    if (query.data === dontspendmycoins){
        skidka = 0
        bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[2],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let newuser = {
                    adress: user_adress,
                    average_price: average_price,
                    average_purchases: average_purchases,
                    coins: user_coins,
                    email: user_email,
                    favourite_food: favourite_food,
                    id: chat.id,
                    name: user_name,
                    phone: user_phone,
                    username: chat.username.toString(),
                    alltime_purchases_amount: alltime_purchases_amount + 1
                }

                let date_now = new Date()
                order_name = 'Delivery/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name)
                order_date = date_now.toString()
                
                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: order_date,
                    order_info: finalbasket,
                    price: finalprice,
                    client_id: chat.id,
                    phone: user_phone,
                    order_status: order_statuses_text[0],
                    adress: user_adress,
                    client_name: user_name
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name + `
├ Адрес: ` + user_adress + `
└ Номер: ` + user_phone + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + order_date + `

`
    console.log('order_date! ' + order_date)
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone, user_name).then(() => {
        
        /* let update = {}
        let bill_message_id = query.message.message_id
        console.log('bills message id: ' + bill_message_id)
        update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
        console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
    })

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
    }

    if (query.data === add_email){
        isMakingChanges = 4
        bot.deleteMessage(chat.id, message_id)
        bot.sendMessage(chat.id, '📩 Напишите ваш email:', {
            reply_markup:{
                keyboard:[
                    [{
                        text: dont_add_email,
                    }]
                ],
                resize_keyboard: true
            }
        })
    }

    if (query.data === dont_add_email){
        isMakingChanges = 0

        let updates = {};
        updates['Delivery/clients/' + chat.id + '/coins'] = user_coins
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chat.id, didntaddemail_text).then(() => {
                anotherpoint_multiple = 2
                keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chat.id, query.message.chat.id, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
            })
        })
    }

    let userdata = fb.database().ref('Delivery/bills/')
    userdata.get().then((result) => {
        let bills_array = Object.keys(result.val())
        console.log('Вы нажимаете на кнопку callback для доставщиков: ' + query.data + ', array = ' + bills_array.length)
        for(let i = 0; i < bills_array.length; i++){
            //console.log(i + ' Processing... ' + query.data + ', ' + (accept_order_callback + bills_array[i]))
            if (query.data === accept_order_callback + bills_array[i].toString()){
                accepted_order_name = bills_array[i]
                console.log('Вы приняли заказ: ' + accepted_order_name)
                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                let orderinfo = fb.database().ref('Delivery/bills/' + bills_array[i]);
                orderinfo.get().then((snapshot) => 
                {
                    console.log(query)
                    console.log('deliverer name2 : ' + query.message.from.first_name + ', ' + query.message.from.id)
                    let accept_date = new Date().toString()
                    //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
                    let updates = {}
                    let order_update = {
                        adress: snapshot.val().adress,
                        client_name: snapshot.val().client_name,
                        date_ordered: snapshot.val().date_ordered,
                        client_id: snapshot.val().client_id,
                        order_info: snapshot.val().order_info,
                        phone: snapshot.val().phone,
                        price: snapshot.val().price,
                        order_status: order_statuses_text[1],
                        deliver_name: query.from.first_name.toString(),
                        accept_date: accept_date,
                        deliver_id: query.from.id.toString()
                    }
                    updates['Delivery/bills/' + bills_array[i]] = order_update
                    //updates['Delivery/clients/CLIENTID/EGO_CHECK'] = order_update
                    fb.database().ref().update(updates)

                    /////ИЗМЕНЯЕМ ЧЕК///////////////
                    deliver_bill_topic = deliver_bill_topic_names[1] + order_statuses_text[1]
                    deliver_bill_client_info = `
                
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().client_name + `
├ Адрес: ` + snapshot.val().adress + `
└ Номер: ` + snapshot.val().phone + `
                
`
                    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + snapshot.val().order_info + `
                
`
                    
                    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + snapshot.val().price + ` тг.
                
`
                
                    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
├ Дата заказа: ` + snapshot.val().date_ordered + `
├ Дата принятия заказа: ` + accept_date + `
└ Имя работника: ` + query.from.first_name.toString() + `, id: `+ query.from.id.toString() + `
`
delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_order_details
                    bot.editMessageText(delivers_bill, {
                        parse_mode: 'HTML',
                        chat_id: query.message.chat.id,
                        message_id: query.message.message_id,
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: '✅ Заказ доставлен',
                                    callback_data: isdelivered_callback + bills_array[i]
                                }]
                            ]
                        }
                    })
                })
            }
            else if (query.data === refuse_order_callback + bills_array[i]){
                console.log('Вы отклонили заказ: ' + bills_array[i])
                let orderinfo = fb.database().ref('Delivery/bills/' + bills_array[i]);
                orderinfo.get().then((snapshot) => 
                {
                    let refuse_date = new Date().toString()
                    //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
                    let updates = {}
                    let order_update = {
                        adress: snapshot.val().adress,
                        client_name: snapshot.val().client_name,
                        date_ordered: snapshot.val().date_ordered,
                        client_id: snapshot.val().client_id,
                        order_info: snapshot.val().order_info,
                        phone: snapshot.val().phone,
                        price: snapshot.val().price,
                        order_status: order_statuses_text[3],
                        deliver_name: query.from.first_name.toString(),
                        accept_date: refuse_date,
                        deliver_id: query.from.id.toString()
                    }
                    updates['Delivery/bills/' + bills_array[i]] = order_update
                    //updates['Delivery/clients/CLIENTID/EGO_CHECK'] = order_update
                    fb.database().ref().update(updates)

                    /////ИЗМЕНЯЕМ ЧЕК///////////////
                    deliver_bill_topic = deliver_bill_topic_names[2] + query.message.chat.first_name
                    deliver_bill_client_info = `
                    
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().client_name + `
├ Адрес: ` + snapshot.val().adress + `
└ Номер: ` + snapshot.val().phone + `
                
`
                    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + snapshot.val().order_info + `
                
`
                    
                    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + snapshot.val().price + ` тг.
                
`
                
                    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
├ Дата заказа: ` + snapshot.val().date_ordered + `
├ Дата отказа от заказа: ` + refuse_date + `
└ Имя работника: ` + query.from.first_name.toString() + `, id: `+ query.from.id.toString() + `
`
delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_order_details
                    bot.editMessageText(delivers_bill, {
                        parse_mode: 'HTML',
                        chat_id: query.message.chat.id,
                        message_id: query.message.message_id,
                    })
                })
                    
            }
            else if (query.data === isdelivered_callback + bills_array[i]){
                accepted_order_name = bills_array[i]
                console.log('Вы доставили заказ: ' + accepted_order_name)
                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                let orderinfo = fb.database().ref('Delivery/bills/' + bills_array[i]);
                orderinfo.get().then((snapshot) => 
                {
                    if (query.from.id.toString() === snapshot.val().deliver_id){
                        let delivered_date = new Date().toString()
                        //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
                        let updates = {}
                        let order_update = {
                            adress: snapshot.val().adress,
                            client_name: snapshot.val().client_name,
                            date_ordered: snapshot.val().date_ordered,
                            client_id: snapshot.val().client_id,
                            order_info: snapshot.val().order_info,
                            phone: snapshot.val().phone,
                            price: snapshot.val().price,
                            order_status: order_statuses_text[2],
                            deliver_name: query.from.first_name.toString(),
                            accept_date: snapshot.val().accept_date,
                            deliver_id: query.from.id.toString(),
                            delivered_date: delivered_date,
                        }
                        updates['Delivery/bills/' + bills_array[i]] = order_update
                        //updates['Delivery/clients/CLIENTID/EGO_CHECK'] = order_update
                        fb.database().ref().update(updates)
    
                        /////ИЗМЕНЯЕМ ЧЕК///////////////
                        deliver_bill_topic = deliver_bill_topic_names[1] + order_statuses_text[2]
                        deliver_bill_client_info = `
                        
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().client_name + `
├ Адрес: ` + snapshot.val().adress + `
└ Номер: ` + snapshot.val().phone + `
                    
`
                        deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + snapshot.val().order_info + `
                    
`
                        
                        deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + snapshot.val().price + ` тг.
                    
`
                    
                        deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
├ Дата заказа: ` + snapshot.val().date_ordered + `
├ Дата принятия заказа: ` + snapshot.val().accept_date + `
├ Дата доставки: ` + delivered_date + `
└ Имя работника: ` + query.from.first_name.toString() + `, id: `+ query.from.id.toString() + `
`
delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_order_details
                        bot.editMessageText(delivers_bill, {
                            parse_mode: 'HTML',
                            chat_id: query.message.chat.id,
                            message_id: query.message.message_id,
                        })
                    }
                    
                })
            }
        }
    })
})

bot.onText(/Admin_controller:GetChatInfo/, msg =>
{
    //console.log(msg)
    const chatId = msg.chat.id
    bot.sendMessage(chatId, chatId)

})
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id
    current_chat = chatId
    if (chatId !== delivery_chat){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello).then(() => {
            anotherpoint_multiple = 2
            keyboards.CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
        })
    }
    if (chatId === delivery_chat){
        bot.sendMessage(chatId, 'Привет! Я буду скидывать сюда заказы. Чтобы начать выполнять заказ, нажмите на кнопку "✅ Принять", под заказом. Так клиент поймет, что его заказ принят.')
    }
})
