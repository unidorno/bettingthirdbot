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

let temp_message = []
var userCity = [] // 0-NurSultan, 1-Almaty
var userPoint = []
//
let userCategory = []
let userCategories = []
let category_keyboard = []
let categories_count = []
//
let userFood
let userFoodlist = []
let foodlist_keyboard = []
let foodlist_count = []
/////////////////////////////////////////////////////////////////
let anotherpoint_multiple = []
let restaurant_name = 'Burger King'

const choosepoint_text = '🛒 Заказать здесь'
const anotherpoint_text = '◀️ Выбрать другое заведение'
const anothercategory_text = '◀️ Выбрать другую категорию'
const choosecity_text = '◀️ Выбрать другой город'
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
const declineorder_button = '❌ Отменить заказ'
let help_phone = '+77077777777'
const didntaddemail_text = '😕 Жаль, что вы не хотите указать свой email. Это еще одна возможность быть в курсе акций и уникальных предложений'
const emailalreadyadded_text = 'Спасибо за то, что выбираете нас! Вы можете сделать заказ еще один заказ: '
const badfeedback_text = '🙁 Нам жаль, что Вы недовольны доставкой. Скажите, как мы можем это исправить?'
const goodfeedback_text = '👍 Отлично! Мы рады, что вам все понравилось'
const dopblank_text = 'Указав информацию ниже, вы ускорите процесс доставки 👇'
const no_sdacha_text = 'Без сдачи 👍'
const no_howtocome_text = 'Не указывать'

const changeamountof_persons = 'Изменить количество персон'
const changepaying_method = 'Изменить способ оплаты'
const changedeliver_date = 'Изменить дату доставки'
const dataiscorrect2_text = 'Информация введена верно'

const leavecomment = '✏️ Написать отзыв'
const dontleavecomment = 'Завершить заказ'
/////////////////////////////////////////////////////////////////
const sticker_hello = 'CAACAgIAAxkBAAIPvWDEwodEiGTkGA1dLSkMLpvHcapdAAIbAAMWQmsK0-zZLL9hUA8fBA'
const sticker_indeliver = 'CAACAgIAAxkBAAIOZGDD2w-QhkTI2ehYT22OovuD5hKuAANZAAKezgsAAS6Enex_r97vHwQ'
const sticker_baddeliver = 'CAACAgIAAxkBAAIOamDD28hX7Watn4Rp6qHAHzXyJJNSAAL2WAACns4LAAFuAwYAAZJBuukfBA'
const sticker_gooddeliver = 'CAACAgIAAxkBAAIOa2DD3FBUep_gdhzbMSkCtAd_SxY4AALuWAACns4LAAGLlC_BC-4ctR8E'

/////////////////////////////////////////////////////////////////
let basket = [] //корзина (массив массивов)
let decrease_foodcount = '-'
let increase_foodcount = '+'
let decrease_foodcount2 = '.-.'
let increase_foodcount2 = '.+.'
let temp_foodamount = []
//let food_categories = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
let food_categories = []
let temp_food_price = [] //
let temp_food_text = [] //
let temp_backet_food = [] //
let finalbasket = [] //
let finalprice = [] //
let finaltime_deelay = ''
let finaltime = new Date()

//food_categories[current_chat] = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
//basket[current_chat] = []

///////////Настройки для системы лояльности///////////
let cashback = 0
let max_pay_percentage = 0
let min_pay_percentage = 0
let percent_foremail = 0
let skidka = [] //[current_chat]

///////////Настройки для рассылки///////////
let cheap_max = 0
let group_buys_amount = 0
let reach_min = 0

///////////////Данные о пользователе//////////////////
let user_phone = []
let user_email = []
let user_adress = []
let user_name = []
let user_username = []
let user_id = []
let average_price = []
let average_purchases = []
let user_coins = []
let added_coins = []
let favourite_food = []
let alltime_purchases_amount = []
let userstatus = []
let order_name = []
let order_date = []
let order_status = []

let user_personsamount = []
let user_payingmethod = []
let user_deliverdate = []
let user_howtocome = []
let user_sdachainfo = []

/* user_phone[current_chat] = ''
user_email[current_chat] = ''
user_adress[current_chat] = ''
user_name[current_chat] = ''
user_username[current_chat] = 'unknown'
user_id[current_chat] = 0
average_price[current_chat] = 0
average_purchases[current_chat] = 0
user_coins[current_chat] = 0
added_coins[current_chat] = 0
favourite_food[current_chat] = 'unknown'
alltime_purchases_amount[current_chat] = 0
userstatus[current_chat] = 'unknown'
order_name[current_chat] = ''
order_date[current_chat] = ''
order_status[current_chat] = 'unknown'
skidka[current_chat] = 0 */

/* finalprice[current_chat] = 0
finalbasket[current_chat] = ''
temp_backet_food[current_chat] = 0
temp_food_text[current_chat] = ''
temp_food_price[current_chat] = 0
temp_foodamount[current_chat] = 1 */

let order_statuses_text = ['В обработке ⏳', '🚴‍♂️ Доставляется', '✅ Доставлен', '❌ Отклонен']
let feedback_options = ['🤩 - Отлично', '😌 - Хорошо', '😒 - Плохо']
let answered_feedback = []
let isAnswered_feedback = []
///////////////////////////////////////////////////////

//////////////////QUERY USER DATA//////////////////////
const changename_text = 'Изменить имя'
const changephone_text = 'Изменить номер'
const changeadress_text = 'Изменить адрес'
let isMakingChanges = []
let isMakingChanges_2 = []
let isMakingChanges_3 = []
///////////////////////////////////////////////////////

let delivery_min_price = 0
let delivery_price = 0
let point_location = []
let point_adress = []
const delivery_started = '✅ Заказ отправлен! Через несколько минут его увидит курьер и приступит к доставке. Мы уведомим Вас об изменении статуса вашего заказа.'

var userlocation = []
var nearest_place = [] //номер ближайшего заведения(в массиве)
var min_distance = []

//////////////////DATA FOR DELIVERS//////////////////////
let deliver_bill_topic_names = ['🎉 Новый заказ!', '⚙️ Заказ принят. Статус: ', '❌ Заказ отклонен работником: ']
let accept_order_callback = 'acc_n'
let refuse_order_callback = 'ref_n'
let isdelivered_callback = 'del_c'
let delivers_bill = ''
let deliver_bill_topic = ''
let deliver_bill_client_info = ''
let deliver_bill_order_info = ''
let deliver_bill_finalprice = 0
let deliver_bill_order_details = ''
let accepted_order_name = ''
let deliver_bill_help_info = ''
///////////////////////////////////////////////////////

////////////////////MESSAGES_COUNTER////////////////////
let add_info_msg = []
let buttons_message = []
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

unregistered_keyboard[3] = [
    [{
        text: declineorder_button
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

/* let date = new Date()
let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
let timeOfffset = 6 //Astana GMT +6
let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
let date_now = Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1) + ' (Нур-Султан GMT+6)' + '.' + Astana_date.getFullYear() + ',' + Astana_date.getHours() + ':' + Astana_date.getMinutes()
 *///console.log(new Date(Astana_date.getTime()).toString())
//let options = { weekday: 'short'}
//let date_now = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1) + ' (Нур-Султан GMT+6)' + '.' + Astana_date.getFullYear() + ', ' + Astana_date.getHours() + ':' + Astana_date.getMinutes()


function StartCheckingOrder(){
    let order_data = fb.database().ref(order_name[current_chat])
    order_data.on('value', (result) => 
    {
        order_status[current_chat] = result.val().order_status
        console.log('ORDER STATUS: ' + result.val().order_status + ', name: "' + order_name[current_chat] + '"')

        if (order_status[current_chat] === order_statuses_text[3]){
            bot.sendMessage(current_chat, 'Нам жаль, но мы были вынуждены отклонить Ваш заказ. Вы можете связаться с нами, нажав на кнопку ' + phone_text, {
                reply_markup:{
                    keyboard:[
                        [{
                            text: '🔃 Заказать снова',
                        }]
                    ],
                    resize_keyboard: true
                }
            })
        }
        
        if (order_status[current_chat] === order_statuses_text[2]){
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

        if (order_status[current_chat] === order_statuses_text[1]){
            //в этом случае выводить клавиатуру как после успешного заказа. Вдруг кто-то по ошибке нажмет что заказ доставлен. Тогда клиент звонит в кафе и после разговора статус снова меняют на "доставляется" и продолжают работать. 
            bot.sendSticker(current_chat, sticker_indeliver).then(() => {
                bot.sendMessage(current_chat, 'Статус заказа изменен на "' +  order_status[current_chat] + '".', {
                    reply_markup: {
                        keyboard: unregistered_keyboard[2],
                        resize_keyboard: true
    
                    }
                }) 
            }) 
        
        }
    }
)
}



var other_data = fb.database().ref('Delivery/other_info')
    other_data.on('value', (snapshot) => 
    {
        help_phone = snapshot.val().contact_phone
        point_location[0] = snapshot.val().latitude
        point_location[1] = snapshot.val().longitude
        point_adress[current_chat] = snapshot.val().adress_text
        delivery_min_price = snapshot.val().delivery_min_price
        delivery_price = snapshot.val().delivery_price
        console.log('!! ' + help_phone + ' ' + point_adress[current_chat] + ' ' + point_location[0] + ' ' + point_location[1])
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

function CheckUser(userid, username, chatId, message_id){
    
    console.log('checking user: ' + userid + ' ' + username)
    let userdata = fb.database().ref('Delivery/clients/' + userid)
    userdata.get().then((result) => 
    {
        console.log('Пользователь зарегистрирован. ID: ' + userid + ' ' + result.val().id)
        user_adress[current_chat] = result.val().adress
        user_email[current_chat] = result.val().email
        user_name[current_chat] = result.val().name
        user_username[current_chat] = result.val().username
        user_phone[current_chat] = result.val().phone
        user_id[current_chat] = result.val().id
        alltime_purchases_amount[current_chat] = result.val().alltime_purchases_amount[current_chat]
        user_coins[current_chat] = result.val().coins

        userstatus[current_chat] = 'registered'

        bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Имя: ' + user_name[current_chat],
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' + user_phone[current_chat],
                        callback_data: changephone_text
                    }],
                    [{
                        text: 'Адрес: ' + user_adress[current_chat],
                        callback_data: changeadress_text
                    }],
                    [{
                        text: dataiscorrect_text,
                        callback_data: dataiscorrect_text
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[current_chat] = message_id + 2
            console.log('savedmessage = ' + add_info_msg[current_chat] + ', ' + message_id)
        })

        StartAnalitycs()

    }).catch(error => {
        console.log('Пользователь не зарегистрирован. ' + error)
        console.log('Данные о незареганном пользователе: ' + user_phone[current_chat] + ', ' + user_adress[current_chat])
        userstatus[current_chat] = 'unregistered'
        /*fb.database().ref('Delivery/clients/').set({
            userid : {
                adress: 'unknown'
            }
            username: name,
            email: email,
            profile_picture : imageUrl
          });*/
        user_name[current_chat] = username
          bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Имя: ' + user_name[current_chat],
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' /* + user_phone[current_chat] */,
                        callback_data: changephone_text
                    }],
                    [{
                        text: 'Адрес: ' /* + user_adress[current_chat] */,
                        callback_data: changeadress_text
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[current_chat] = message_id + 2 
            console.log('savedmessage = ' + add_info_msg[current_chat] + ', ' + message_id)
        })

        StartAnalitycs()
    })
}

function StartAnalitycs(){
    
    //узнаем любимую еду пользователя
    for (let i = 0; i < basket[current_chat].length; i++){
        if (basket[current_chat][i][3] === 0){
            //тут идут завтраки, а значит попадает в категорию "основное"
            food_categories[current_chat][5][1] = food_categories[current_chat][5][1] + basket[current_chat][i][1]
            console.log('Добавляем в категорию "основное" очки. Основного теперь: ' + food_categories[current_chat][5][1])
        }
        if (basket[current_chat][i][3] === 1){
            //тут идут десерты, значит попадает в "десерты"
            food_categories[current_chat][3][1] = food_categories[current_chat][3][1] + basket[current_chat][i][1]
            console.log('Добавляем в категорию "десерты" очки. Десертов теперь: ' + food_categories[current_chat][3][1])
        }
        if (i === basket[current_chat].length - 1){
            //все распределили, теперь узнаем какую еду любим
            console.log('Баллы определили. Теперь выбираем любимую еду')
            let favourite_food_number = []
            favourite_food_number[current_chat] = 0
            for (let i = 0; i < food_categories[current_chat].length; i++){
                if (i <= food_categories[current_chat].length - 1){
                    console.log('Сравниваем категорию #' + i + ' и #' + (i+1))
                    /* if (food_categories[current_chat][i][1] >= food_categories[current_chat][i+1][1]){
                        favourite_food[current_chat]= food_categories[current_chat][i][0]
                        console.log(i +' 1 Категория ' + food_categories[current_chat][i][0] + ' больше, чем категория ' + food_categories[current_chat][i+1][0])
                    }
                    else if (food_categories[current_chat][i][1] < food_categories[current_chat][i+1][1]){
                        favourite_food[current_chat]= food_categories[current_chat][i+1][0]
                        console.log(i + ' 2 Категория ' + food_categories[current_chat][i+1][0] + ' больше, чем категория ' + food_categories[current_chat][i][0])
                    }*/
                    if (food_categories[current_chat][i][1] >= favourite_food_number[current_chat]){
                        favourite_food[current_chat]= food_categories[current_chat][i][2]
                        favourite_food_number[current_chat] = food_categories[current_chat][i][1]
                        console.log(i +' 1 Категория ' + food_categories[current_chat][i][0] + ' больше')
                    }
                    if (i === food_categories[current_chat].length - 1){
                        console.log('WINNER: ' + favourite_food[current_chat])
                    } 

                }
            }
        }
    }

    //узаем средний чек пользователя
    if (average_price[current_chat] === 0){
        console.log('1 finalprice is ' + finalprice[current_chat])
        average_price[current_chat] = finalprice[current_chat]
    }
    if (average_price[current_chat] !== 0){
        console.log('2 finalprice is ' + finalprice[current_chat])
        average_price[current_chat] = (average_price[current_chat] + finalprice[current_chat]) / 2
        console.log('2 average price is ' + average_price[current_chat])
    }

    //узнаем среднее число заказываемых за раз блюд
    if (average_purchases[current_chat] === 0){
        for (let i = 0; i < basket[current_chat].length; i++){
            average_purchases[current_chat] += basket[current_chat][i][1]
            if (i === basket[current_chat] - 1){
                console.log('1 purchases amount = ' + average_purchases[current_chat])
            }
        }
    }
    if (average_purchases[current_chat] !== 0){
        let temp_purchases = 0
        for (let i = 0; i < basket[current_chat].length; i++){
            temp_purchases += basket[current_chat][i][1]
            if (i === basket[current_chat] - 1){
                console.log('2 old purchases amount = ' + average_purchases[current_chat])
                console.log('2 new purchases amount = ' + temp_purchases)
                average_purchases[current_chat] = (average_purchases[current_chat] + temp_purchases) / 2
                console.log('2 final purchases amount = ' + average_purchases[current_chat])
            }
        }
    }
}

function AddMailingData(){

    if (finalprice[current_chat] >= reach_min){
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

    if (finalprice[current_chat] <= cheap_max){
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

    for (let i = 0; i < food_categories[current_chat].length; i++){
        if (favourite_food[current_chat]=== food_categories[current_chat][i][2]){
            console.log('!!! Delivery/mailing/categories/' + food_categories[current_chat][i][2])
            let userdata = fb.database().ref('Delivery/mailing/categories/' + food_categories[current_chat][i][2])
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
                        updates['Delivery/mailing/categories/' + favourite_food[current_chat]+ '/user_amount'] = count

                        if (user_ids_string !== ''){
                            user_ids_string += ',' + current_chat
                        }
    
                        else if (user_ids_string === ''){
                            user_ids_string += current_chat
                        }

                        updates['Delivery/mailing/categories/' + favourite_food[current_chat]+ '/user_ids'] = user_ids_string
                        
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

bot.on('polling_error', console.log);

bot.on('poll_answer', poll_answer => {
    answered_feedback[poll_answer.user.id] = poll_answer.option_ids
    console.log('^^ ' + isAnswered_feedback[poll_answer.user.id])
    if (isAnswered_feedback[poll_answer.user.id] === 0){
        console.log('answered!')
        isAnswered_feedback[poll_answer.user.id] = 1
        if (answered_feedback[poll_answer.user.id] > 1){
            bot.sendSticker(poll_answer.user.id, sticker_baddeliver).then(() => {
                bot.sendMessage(poll_answer.user.id, badfeedback_text, {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: leavecomment,
                                callback_data: leavecomment
                            }],
                            [{
                                text: dontleavecomment,
                                callback_data: dontleavecomment
                            }]
                        ]
                    }
                })
            })
        }
        if (answered_feedback[poll_answer.user.id] <= 1){
            bot.sendSticker(poll_answer.user.id, sticker_gooddeliver).then(() => {
                bot.sendMessage(poll_answer.user.id, goodfeedback_text, {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: leavecomment,
                                callback_data: leavecomment
                            }],
                            [{
                                text: dontleavecomment,
                                callback_data: dontleavecomment
                            }]
                        ]
                    }
                })
            })
        }
        
        
    }
})

bot.on('pre_checkout_query', pre_checkout_query => {
    bot.answerPreCheckoutQuery( pre_checkout_query.id, true, {
        error_message: 'При оплате произошла ошибка. Попробуйте повторить действие позже'
    })

})

bot.on('location', (msg) => {
    userlocation[current_chat][0] = msg.location.latitude
    userlocation[current_chat][1] = msg.location.longitude
    let point1 = new GeoPoint(userlocation[current_chat][0], userlocation[current_chat][1], false)
    if (userCity[current_chat] === 0){
        for (let i = 0; i < NurSultan_adresses.length; i++) {
            let point2 = new GeoPoint(NurSultan_geo1[i], NurSultan_geo2[i], false)
            let distance = point1.distanceTo(point2, true)//output in kilometers
            //console.log('дистанция до адреса: ' + NurSultan_adresses[i] + ' = ' + distance)
            if (distance < min_distance[current_chat]){
                min_distance[current_chat] = distance
                nearest_place[current_chat] = i
            }
            if (i === NurSultan_adresses.length - 1) {
                userPoint[current_chat] = nearest_place[current_chat]
                bot.sendLocation(msg.chat.id, NurSultan_geo1[nearest_place[current_chat]], NurSultan_geo2[nearest_place[current_chat]]).then(() => {
                    bot.sendMessage(msg.chat.id, 'Ближайшая к этой локации точка Coffee BOOM находится по адресу: ' + NurSultan_adresses[nearest_place[current_chat]], {
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
    else if (userCity[current_chat] === 1){
        for (let i = 0; i < Almaty_adresses.length; i++) {
            let point2 = new GeoPoint(Almaty_geo1[i], Almaty_geo2[i], false)
            let distance = point1.distanceTo(point2, true)//output in kilometers
            if (distance < min_distance[current_chat]){
                min_distance[current_chat] = distance
                nearest_place[current_chat] = i
            }
            if (i === Almaty_adresses.length - 1) {
                userPoint[current_chat] = nearest_place[current_chat]
                bot.sendLocation(msg.chat.id, Almaty_geo1[nearest_place[current_chat]], Almaty_geo2[nearest_place[current_chat]]).then(() => {
                    bot.sendMessage(msg.chat.id, 'Ближайшая к этой локации точка Coffee BOOM находится по адресу: ' + Almaty_adresses[nearest_place[current_chat]], {
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

    current_chat = chatId

    if (msg.text === '🔃 Заказать снова'){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello).then(() => {
            Reset(chatId)
            anotherpoint_multiple[chatId] = 2
            keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
        })
    }

    if (msg.text === coins_text){
        /* bot.editMessageText(msg.text, {
            chat_id: chatId,
            message_id: msg.message_id - 1
        }).then(() => {
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
            })
        }) */

        bot.deleteMessage(chatId, msg.message_id).then(() => {
            bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
        })
    }

    if (msg.text === anotherpoint_text){
        finalprice[chatId] = 0
        finaltime_deelay = 0
        finalbasket[chatId] = 0
        console.log('2414124')
        if (userFood !== null || userFoodlist[chatId] !== []){
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
        console.log('DELETING: ' + buttons_message[chatId])
        bot.deleteMessage(chatId, buttons_message[chatId]).catch(err => {
            console.log(err)
        })
        bot.deleteMessage(chatId, msg.message_id).catch(err => {
            console.log(err)
        })
        bot.deleteMessage(chatId, msg.message_id - 1).then(() => {
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket[chatId].length; i++){
                            finalsum += (basket[chatId][i][2] * basket[chatId][i][1])   
                            if (i === basket[chatId].length - 1){
                                editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                                console.log(finalsum + ' ' + i)
                                finalprice[chatId] = finalsum + delivery_price
                                for (let i = 0; i < basket[chatId].length; i++){
                                    console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                    editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                    if (i === basket[chatId].length - 1){
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
                                        }).then(() => {
                                            buttons_message[chatId] = msg.message_id
                                            console.log('& ' + buttons_message[chatId])
                                        })
            
                                    }
                                }
                            }
            }
        }).catch(err => {
            console.log(err)
        })
        
    }

    if (msg.text === myorder_text){

        //bot.deleteMessage(chatId, msg.message_id-1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket[chatId].length; i++){
                            finalsum += (basket[chatId][i][2] * basket[chatId][i][1])
                            if (i === basket[chatId].length - 1){
                                editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                                console.log(finalsum + ' ' + i)
                                for (let i = 0; i < basket[chatId].length; i++){
                                    console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                    editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                        if (skidka[chatId] !== 0) {
                                            editmsg += `

Цена с учетом скидки: ` + finalprice[chatId] + ' тенге.'
                                        }
                                        if (i === basket[chatId].length - 1){
                                        bot.sendMessage(chatId,  editmsg)
                                    }
                                }
                            }
            }
        })
        
    }

    if (msg.text === paybasket_text){
        console.log('!!!' + (finalprice[chatId] - 1000))
        if (finalprice[chatId] - 1000 < delivery_min_price){
            bot.sendMessage(chatId, 'Минимальная сумма заказа: ' + delivery_min_price + '. Закажите что-нибудь еще 😇')
        }
        else {
            finaltime_deelay = 0
            bot.deleteMessage(chatId, msg.message_id - 1)
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chatId].length; i++){
                                finalsum += (basket[chatId][i][2] * basket[chatId][i][1])
                                if (i === basket[chatId].length - 1){
                                    editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                                    console.log(finalsum + ' ' + i)
                                    finalprice[chatId] = finalsum + delivery_price
                                    for (let i = 0; i < basket[chatId].length; i++){
                                        console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                        editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                        if (i === basket[chatId].length - 1){
                                            finalbasket[chatId] = editmsg
                                            bot.sendMessage(chatId,  editmsg).then(() => {
                                                CheckUser(msg.chat.id, msg.chat.first_name, chatId, msg.message_id)
                                            })
                
                                        }
                                    }
                                }
                }
            })
        }
        
    }

    if (msg.text === location_text){
        bot.sendLocation(chatId, point_location[0], point_location[1]).then(() => {
            bot.sendMessage(chatId, '📍 Мы находимся по адресу: ' + point_adress[chatId])
        })
        
    }
    if (msg.text === phone_text){
        bot.sendContact(chatId, help_phone, restaurant_name)
    }

    if (isMakingChanges[chatId] !== 0){
        if (isMakingChanges[chatId] === 1){
            isMakingChanges[chatId] = 0
            user_name[chatId] = msg.text
        }

        if (isMakingChanges[chatId] === 2){
            isMakingChanges[chatId] = 0
            user_phone[chatId] = msg.text
        }

        if (isMakingChanges[chatId] === 3){
            isMakingChanges[chatId] = 0
            user_adress[chatId] = msg.text
        }

        if (isMakingChanges[chatId] === 4){
            isMakingChanges[chatId] = 0
            user_email[chatId] = msg.text
            user_coins[chatId] = user_coins[chatId] + (added_coins[chatId] * percent_foremail)
            user_coins[chatId] = Math.round(user_coins[chatId])
            //тут возвращаем пользователя на главную, но уже регистеред

            let updates = {};
            updates['Delivery/clients/' + msg.chat.id + '/email'] = user_email[chatId]
            updates['Delivery/clients/' + msg.chat.id + '/coins'] = user_coins[chatId]
            fb.database().ref().update(updates).then(() => {
                //тут отправить в главное меню
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        console.log(err)
                    })
                }
                bot.sendMessage(chatId, 'Ура! Email подтвержден. Вам было зачислено ' + (added_coins[chatId] * percent_foremail) + ' тенге. Ваш баланс: ' + user_coins[chatId] + ' тенге').then(() => {
                    Reset(chatId)
                    anotherpoint_multiple[chatId] = 2
                    keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                })
            })
        }

        if (isMakingChanges[chatId] === 5){
            isMakingChanges[chatId] = 0
            let orderinfo = fb.database().ref(order_name[chatId]);
            orderinfo.get().then((snapshot) => 
            {
                console.log('saving poll...')
                let updates = {}
                let bill_update = {
                    adress: snapshot.val().adress,
                    client_name: snapshot.val().client_name,
                    date_ordered: snapshot.val().date_ordered,
                    client_id: snapshot.val().client_id,
                    order_info: snapshot.val().order_info,
                    phone: snapshot.val().phone,
                    price: snapshot.val().price,
                    order_status: snapshot.val().order_status,
                    deliver_name: snapshot.val().deliver_name,
                    accept_date: snapshot.val().accept_date,
                    deliver_id: snapshot.val().deliver_id,
                    message_id: snapshot.val().message_id,
                    delivered_date: snapshot.val().delivered_date,
                    feedback: feedback_options[answered_feedback[chatId]],
                    feedback_message: msg.text,
                    bill_text: snapshot.val().bill_text,
                    user_personsamount: snapshot.val().user_personsamount,
                    user_payingmethod: snapshot.val().user_payingmethod,
                    user_deliverdate: snapshot.val().user_deliverdate,
                    user_sdachainfo: snapshot.val().user_sdachainfo,
                    user_howtocome: snapshot.val().user_howtocome
                }
                updates[order_name[chatId]] = bill_update
                updates['Delivery/clients/' + chatId + '/coins'] = user_coins[chatId]
                fb.database().ref().update(updates).then(() => {
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                            console.log(err)
                        })
                    }
                    bot.sendSticker(chatId, sticker_hello).then(() => {
                        Reset(chatId)
                        anotherpoint_multiple[chatId] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                    })

                    let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
├ Оценка клиента: ` + feedback_options[answered_feedback[chatId]] + `
└ Сообщение: ` + msg.text
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: delivery_chat,
                        message_id: snapshot.val().message_id
                    })
                }).catch(error => {
                    console.log(error)
                })
            }) 
        }

        if (user_adress[chatId] !== '' && user_phone[chatId] !== '' && user_name[chatId] !== '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5){
            //order_status = order_statuses_text[0]
            console.log('LOL ' + msg.message_id + ', ' + (msg.message_id - 1))
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                console.log('LOL2 ' + msg.message_id + ', ' + (msg.message_id - 1))
            })

            bot.editMessageText(almostthere_text, {
                chat_id: chatId,
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Имя: ' + user_name[chatId],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chatId],
                            callback_data: changephone_text
                        }],
                        [{
                            text: 'Адрес: ' + user_adress[chatId],
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
                console.log(err)
            })
            
        }
        if (user_adress[chatId] === '' || user_phone[chatId] === '' || user_name[chatId] === '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5)
        {
            console.log('LOL3 ' + msg.message_id + ', ' + (msg.message_id - 1) + ', save_msgid: ' + add_info_msg[chatId])
            bot.deleteMessage(chatId, msg.message_id)
            
          bot.editMessageText(almostthere_text, {
                chat_id: chatId,
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Имя: ' + user_name[chatId],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chatId],
                            callback_data: changephone_text
                        }],
                        [{
                            text: 'Адрес: ' + user_adress[chatId],
                            callback_data: changeadress_text
                        }]
                    ]
                }
            }
            ).catch(err => {
                console.log(err)
            })
            
            
        }
    }

    if (isMakingChanges_3[chatId] === 1){
        isMakingChanges_3[chatId] = 0
        isMakingChanges_2[chatId] = 0
        console.log('isMakingChanges 3!')
        
        user_howtocome[chatId] = msg.text
        if (userstatus[chatId] !== 'unregistered'){
            bot.deleteMessage(chatId, add_info_msg[chatId])
            if (user_coins[chatId] >= (finalprice[chatId] * min_pay_percentage)){
                if (user_coins[chatId] <= (finalprice[chatId] * max_pay_percentage)){
                    //тут можно оплатить всеми баллами.
                    bot.deleteMessage(chatId, add_info_msg[chatId])
                    skidka[chatId] = user_coins[chatId]
                    bot.sendMessage(chatId, 'У вас есть ' + user_coins[chatId] + ' тенге, которыми можно оплатить заказ. Сумма заказа с учетом скидки: ' + (finalprice[chatId]-user_coins[chatId]) + ' тенге. Хотите потратить их сейчас?', {
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
                else if (user_coins[chatId] > (finalprice[chatId] * max_pay_percentage)){
                    bot.deleteMessage(chatId, add_info_msg[chatId])
                    //тут оплачиваем максимальным количеством баллов
                    skidka[chatId] = finalprice[chatId] * max_pay_percentage
                    bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Вы можете потратить ' + finalprice[chatId] * max_pay_percentage + 'тенге на оплату заказа. Сумма заказа с учетом скидки: ' + (finalprice[chatId] - ( finalprice[chatId] * max_pay_percentage)) + ' тенге. Хотите сделать это?', {
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
                skidka[chatId] = 0
                order_status[chatId] = order_statuses_text[0]
                bot.sendMessage(chatId, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let username = []
                username[chatId] = "undefined"
                if (msg.chat.username != undefined) username[chatId] = msg.chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chatId] = 1
                if (alltime_purchases_amount[chatId] > 0){
                    alltimepurchases[chatId] = alltime_purchases_amount[chatId] + 1
                }

                let newuser = {
                    adress: user_adress[chatId],
                    average_price: average_price[chatId],
                    average_purchases: average_purchases[chatId],
                    coins: user_coins[chatId],
                    email: user_email[chatId],
                    favourite_food: favourite_food[chatId],
                    id: chatId,
                    name: user_name[chatId],
                    phone: user_phone[chatId],
                    username: username[chatId],
                    alltime_purchases_amount: alltimepurchases[chatId]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chatId] = 'Delivery/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name[chatId])
                order_date[chatId] = date_now.toString()
                
                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chatId],
                    price: finalprice[chatId],
                    client_id: chatId,
                    phone: user_phone[chatId],
                    order_status: order_statuses_text[0],
                    adress: user_adress[chatId],
                    client_name: user_name[chatId],
                    user_personsamount: user_personsamount[chatId],
                    user_payingmethod: user_payingmethod[chatId],
                    user_deliverdate: user_deliverdate[chatId],
                    user_sdachainfo: user_sdachainfo[chatId],
                    user_howtocome: user_howtocome[chatId]
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chatId] === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus[chatId] = 'registered'
                    }

                    updates['Delivery/clients/' + chatId] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chatId] + `
├ Адрес: ` + user_adress[chatId] + `
└ Номер: ` + user_phone[chatId] + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chatId] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chatId] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chatId] + `
├ Способ оплаты: ` + user_payingmethod[chatId] + `
├ Купюра оплаты: ` + user_sdachainfo[chatId] + `
└ Когда доставить: ` + user_deliverdate[chatId] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chatId] + `

`
    console.log('order_date! ' + order_date[chatId])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + msg.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date[chatId]
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date[chatId]
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone[chatId], user_name[chatId]).then(() => {
        
        /* let update = {}
        let bill_message_id = query.message.message_id
        console.log('bills message id: ' + bill_message_id)
        update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
        console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
    })
            }
        }
        else {
            bot.deleteMessage(chatId, add_info_msg[chatId]).then(() => {
                order_status[chatId] = order_statuses_text[0]
                bot.sendMessage(chatId, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })

                let updates = {};

                let username = []
                username[chatId] = "undefined"
                if (msg.chat.username != undefined) username[chatId] = msg.chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chatId] = 1
                if (alltime_purchases_amount[chatId] > 0){
                    alltimepurchases[chatId] = alltime_purchases_amount[chatId] + 1
                }
                

                let newuser = {
                    adress: user_adress[chatId],
                    average_price: average_price[chatId],
                    average_purchases: average_purchases[chatId],
                    coins: user_coins[chatId],
                    email: user_email[chatId],
                    favourite_food: favourite_food[chatId],
                    id: chatId,
                    name: user_name[chatId],
                    phone: user_phone[chatId],
                    username: username[chatId],
                    alltime_purchases_amount: alltimepurchases[chatId]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chatId] = 'Delivery/bills/' + date_now.toString()
                order_date[chatId] = date_now.toString()
                console.log('ORDER NAME: ' + order_name[chatId])

                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chatId],
                    price: finalprice[chatId],
                    client_id: chatId,
                    phone: user_phone[chatId],
                    order_status: order_statuses_text[0],
                    adress: user_adress[chatId],
                    client_name: user_name[chatId],
                    user_personsamount: user_personsamount[chatId],
                    user_payingmethod: user_payingmethod[chatId],
                    user_deliverdate: user_deliverdate[chatId],
                    user_sdachainfo: user_sdachainfo[chatId],
                    user_howtocome: user_howtocome[chatId]
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    console.log('WARNING! ' + userstatus[chatId])
                    if (userstatus[chatId] === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus[chatId] = 'registered'
                    }

                    updates['Delivery/clients/' + chatId] = newuser
                    updates[order_name[chatId]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder() 
                    
                }).catch(err => {
                    console.log('error: ' + err)
                })

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = Astana_date.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = Astana_date.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
    
    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chatId] + `
├ Адрес: ` + user_adress[chatId] + `
└ Номер: ` + user_phone[chatId] + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chatId] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chatId] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chatId] + `
├ Способ оплаты: ` + user_payingmethod[chatId] + `
├ Купюра оплаты: ` + user_sdachainfo[chatId] + `
└ Когда доставить: ` + user_deliverdate[chatId] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chatId] + `

`
    console.log('order_date! ' + order_date[chatId])

    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + msg.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date[chatId]
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date[chatId]
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone[chatId], user_name[chatId])
        /* let update = {}
        let bill_message_id = query.message.message_id
        console.log('bills message id: ' + bill_message_id)
        update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
        console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
    }).catch(err => {
        console.log('error: ' + err)
    })

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
    }

    if (isMakingChanges_2[chatId] !== 0){
        if (isMakingChanges_2[chatId] === 1){
            isMakingChanges_2[chatId] = 0
            user_personsamount[chatId] = msg.text
        }

        if (isMakingChanges_2[chatId] === 2){
            isMakingChanges_2[chatId] = 0
            user_deliverdate[chatId] = msg.text
        }

        if (isMakingChanges_2[chatId] === 3){
            console.log('isMakingChanges_2!')
            isMakingChanges_3[chatId] = 1
            user_sdachainfo[chatId] = msg.text
            bot.deleteMessage(chatId, msg.message_id).catch(err => {
                console.log(err)
            })
            bot.editMessageText('Уточните, как курьер может до вас добраться: ', {
                chat_id: chatId, 
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: no_howtocome_text,
                            callback_data: no_howtocome_text
                        }]
                    ]
                }
            }).catch(err => {
                console.log(add_info_msg[chatId] + ' | ' + msg.message_id + ' | ' + err)
            })
        }

        if (isMakingChanges_2[chatId] === 4){
            isMakingChanges_2[chatId] = 0
            user_howtocome[chatId] = msg.text
            console.log('!HERE!')
            if (userstatus[chatId] !== 'unregistered'){
                bot.deleteMessage(chatId, add_info_msg[chatId])
                if (user_coins[chatId] >= (finalprice[chatId] * min_pay_percentage)){
                    if (user_coins[chatId] <= (finalprice[chatId] * max_pay_percentage)){
                        //тут можно оплатить всеми баллами.
                        bot.deleteMessage(chatId, add_info_msg[chatId])
                        skidka[chatId] = user_coins[chatId]
                        bot.sendMessage(chatId, 'У вас есть ' + user_coins[chatId] + ' тенге, которыми можно оплатить заказ. Сумма заказа с учетом скидки: ' + (finalprice[chatId]-user_coins[chatId]) + ' тенге. Хотите потратить их сейчас?', {
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
                    else if (user_coins[chatId] > (finalprice[chatId] * max_pay_percentage)){
                        bot.deleteMessage(chatId, add_info_msg[chatId])
                        //тут оплачиваем максимальным количеством баллов
                        skidka[chatId] = finalprice[chatId] * max_pay_percentage
                        bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Вы можете потратить ' + finalprice[chatId] * max_pay_percentage + 'тенге на оплату заказа. Сумма заказа с учетом скидки: ' + (finalprice[chatId] - ( finalprice[chatId] * max_pay_percentage)) + ' тенге. Хотите сделать это?', {
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
                    skidka[chatId] = 0
                    order_status[chatId] = order_statuses_text[0]
                    bot.sendMessage(chatId, delivery_started, {
                        reply_markup: {
                            keyboard: unregistered_keyboard[3],
                            resize_keyboard: true
        
                        }
                    })
                    
                    let updates = {};
    
                    let username = []
                    username[chatId] = "undefined"
                    if (msg.chat.username != undefined) username[chatId] = msg.chat.username.toString()
                    
                    let alltimepurchases = []
                    alltimepurchases[chatId] = 1
                    if (alltime_purchases_amount[chatId] > 0){
                        alltimepurchases[chatId] = alltime_purchases_amount[chatId] + 1
                    }
    
                    let newuser = {
                        adress: user_adress[chatId],
                        average_price: average_price[chatId],
                        average_purchases: average_purchases[chatId],
                        coins: user_coins[chatId],
                        email: user_email[chatId],
                        favourite_food: favourite_food[chatId],
                        id: chatId,
                        name: user_name[chatId],
                        phone: user_phone[chatId],
                        username: username[chatId],
                        alltime_purchases_amount: alltimepurchases[chatId]
                    }
    
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                    let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                
    
                    order_name[chatId] = 'Delivery/bills/' + date_now.toString()
                    console.log('ORDER NAME: ' + order_name[chatId])
                    order_date[chatId] = date_now.toString()
                    
                    //date_now = Date.now()
                    //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                    let newbill = {
                        date_ordered: Astana_date.getTime(),
                        order_info: finalbasket[chatId],
                        price: finalprice[chatId],
                        client_id: chatId,
                        phone: user_phone[chatId],
                        order_status: order_statuses_text[0],
                        adress: user_adress[chatId],
                        client_name: user_name[chatId],
                        user_personsamount: user_personsamount[chatId],
                        user_payingmethod: user_payingmethod[chatId],
                        user_deliverdate: user_deliverdate[chatId],
                        user_sdachainfo: user_sdachainfo[chatId],
                        user_howtocome: user_howtocome[chatId]
                    }
    
                    let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                        clientsamount.get().then((snapshot) => {
                        let count = snapshot.val();
                        if (userstatus[chatId] === 'unregistered'){
                            count++
                            updates['Delivery/clients/clients_amount'] = count
                            userstatus[chatId] = 'registered'
                        }
    
                        updates['Delivery/clients/' + chatId] = newuser
                        updates['Delivery/bills/' + date_now] = newbill
    
                        fb.database().ref().update(updates)
    
                        AddMailingData()
                        StartCheckingOrder()
                    })
    
                                      ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
        let options = { weekday: 'short'}
        
    let minutes = Astana_date.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = Astana_date.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
    
        deliver_bill_topic = deliver_bill_topic_names[0]
        deliver_bill_client_info = `
    
<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chatId] + `
├ Адрес: ` + user_adress[chatId] + `
└ Номер: ` + user_phone[chatId] + `
    
`
        deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chatId] + `
    
`
        
        deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chatId] + ` тг.
    
`
    
        deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `
    
    `
        deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chatId] + `
├ Способ оплаты: ` + user_payingmethod[chatId] + `
├ Купюра оплаты: ` + user_sdachainfo[chatId] + `
└ Когда доставить: ` + user_deliverdate[chatId] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chatId] + `

`
        console.log('order_date! ' + order_date[chatId])
        delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
        console.log('last message id: ' + msg.message_id)
        bot.sendMessage(delivery_chat, delivers_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chatId]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chatId]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chatId], user_name[chatId]).then(() => {
            
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
        })
                }
            }
            else {
                bot.deleteMessage(chatId, add_info_msg[chatId]).then(() => {
                    order_status[chatId] = order_statuses_text[0]
                    bot.sendMessage(chatId, delivery_started, {
                        reply_markup: {
                            keyboard: unregistered_keyboard[3],
                            resize_keyboard: true
        
                        }
                    })
    
                    let updates = {};
    
                    let username = []
                    username[chatId] = "undefined"
                    if (chat.username != undefined) username[chatId] = chat.username.toString()
                    
                    let alltimepurchases = []
                    alltimepurchases[chatId] = 1
                    if (alltime_purchases_amount[chatId] > 0){
                        alltimepurchases[chatId] = alltime_purchases_amount[chatId] + 1
                    }
                    
    
                    let newuser = {
                        adress: user_adress[chatId],
                        average_price: average_price[chatId],
                        average_purchases: average_purchases[chatId],
                        coins: user_coins[chatId],
                        email: user_email[chatId],
                        favourite_food: favourite_food[chatId],
                        id: chatId,
                        name: user_name[chatId],
                        phone: user_phone[chatId],
                        username: username[chatId],
                        alltime_purchases_amount: alltimepurchases[chatId]
                    }
    
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                    let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                
    
                    //date_now = Date.now()
                    //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                    order_name[chatId] = 'Delivery/bills/' + date_now.toString()
                    order_date[chatId] = date_now.toString()
                    console.log('ORDER NAME: ' + order_name[chatId])
    
                    let newbill = {
                        date_ordered: Astana_date.getTime(),
                        order_info: finalbasket[chatId],
                        price: finalprice[chatId],
                        client_id: chatId,
                        phone: user_phone[chatId],
                        order_status: order_statuses_text[0],
                        adress: user_adress[chatId],
                        client_name: user_name[chatId],
                        user_personsamount: user_personsamount[chatId],
                        user_payingmethod: user_payingmethod[chatId],
                        user_deliverdate: user_deliverdate[chatId],
                        user_sdachainfo: user_sdachainfo[chatId],
                        user_howtocome: user_howtocome[chatId]
                    }
    
                    let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                        clientsamount.get().then((snapshot) => {
                        let count = snapshot.val();
                        console.log('WARNING! ' + userstatus[chatId])
                        if (userstatus[chatId] === 'unregistered'){
                            count++
                            updates['Delivery/clients/clients_amount'] = count
                            userstatus[chatId] = 'registered'
                        }
    
                        updates['Delivery/clients/' + chatId] = newuser
                        updates[order_name[chatId]] = newbill
    
                        fb.database().ref().update(updates)
    
                        AddMailingData()
                        StartCheckingOrder() 
                        
                    }).catch(err => {
                        console.log('error: ' + err)
                    })
    
                       ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
        let options = { weekday: 'short'}
        let minutes = Astana_date.getMinutes()
        if (minutes < 10) minutes = '0' + minutes
        let hours = Astana_date.getHours()
        if (hours < 10) hours = '0' + hours
        let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
        
        deliver_bill_topic = deliver_bill_topic_names[0]
        deliver_bill_client_info = `
    
<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chatId] + `
├ Адрес: ` + user_adress[chatId] + `
└ Номер: ` + user_phone[chatId] + `
    
`
        deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chatId] + `
    
`
        
        deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chatId] + ` тг.
    
`
    
        deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `
    
    `
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chatId] + `
├ Способ оплаты: ` + user_payingmethod[chatId] + `
├ Купюра оплаты: ` + user_sdachainfo[chatId] + `
└ Когда доставить: ` + user_deliverdate[chatId] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chatId] + `

`
        console.log('order_date! ' + order_date[chatId])
    
        delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
        console.log('last message id: ' + msg.message_id)
        bot.sendMessage(delivery_chat, delivers_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chatId]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chatId]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chatId], user_name[chatId])
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
        }).catch(err => {
            console.log('error: ' + err)
        })
    
        ////////////////////////////////////////////////////////////////////////
    
                    //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
                }).catch(err => {
                    console.log('error: ' + err)
                })
            }
        }

        if (isMakingChanges_2[chatId] !== 3 && isMakingChanges_2[chatId] !== 4){
            bot.deleteMessage(chatId, msg.message_id).catch(err => {
                console.log(add_info_msg[chatId] + ' | ' + msg.message_id + ' | ' + err)
            })
            
            bot.editMessageText(almostthere_text, {
                  chat_id: chatId,
                  message_id: add_info_msg[chatId],
                  reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Кол-во персон: ' + user_personsamount[chatId],
                            callback_data: changeamountof_persons
                        }],
                        [{
                            text: 'Когда доставить: ' + user_deliverdate[chatId],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: 'Способ оплаты: ' + user_payingmethod[chatId],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
              }
              ).catch(err => {
                  console.log(add_info_msg[chatId] + ' | ' + msg.message_id + ' | ' + err)
              })
        }
        
    }

    if (msg.text === order_status_button){
        bot.deleteMessage(msg.chat.id, msg.message_id).then(() => {
            console.log('Order name: "' + order_name[chatId] + '"')
            let userdata = fb.database().ref(order_name[chatId])
            userdata.get().then((result) => {
                order_status[chatId] = result.val().order_status
                console.log('order_status: ' + result.val().order_status)
                console.log('order link: Delivery/bills/' + order_name[chatId])
                bot.sendMessage(msg.chat.id, 'Статус вашего заказа: ' + order_status[chatId])
            }) 
        })
    }

    if (msg.text === finish_order_text){
        bot.deleteMessage(chatId, msg.message_id - 1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {

            user_coins[chatId] = user_coins[chatId] + (finalprice[chatId] * cashback)
            user_coins[chatId] = Math.round(user_coins[chatId])
            added_coins[chatId] = (finalprice[chatId] * cashback)
            added_coins[chatId] = Math.round(added_coins[chatId])
            console.log('coins = ' + user_coins[chatId] + '. Было начислено ' + added_coins[chatId] + '. Cashback: ' + cashback + '. Finalprice: ' + finalprice[chatId])

/*             order_status[chatId] = 'unknown'
            order_name[chatId] = ''
            finalbasket[chatId] = ''
            finalprice[chatId] = 0
            basket[chatId] = [] */

            let poll_text = 'Спасибо за заказ! Пожалуйста, оцените качество доставки: '
            bot.sendMessage(chatId, poll_text).then(() => {
                bot.sendPoll(chatId, 'Как оцените наш сервис?', feedback_options, {
                    is_anonymous: false
                })
            })

            /* if (user_email[chatId] === 'unknown'){
                
                let tmp_text = `Вам было зачислено <b>` + added_coins[chatId] + `</b> тенге. Ваш счет: ` + user_coins[chatId] + ` тенге. Ими можно оплачивать следующие заказы. 
                
Кстати, если Вы привяжете к этому аккаунту свой email, то получите еще <b>` + (added_coins[chatId] * percent_foremail) + `</b> тенге. 

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

            else if (user_email[chatId] !== 'unknown'){
                let updates = {};
                updates['Delivery/clients/' + msg.chat.id + '/coins'] = user_coins[chatId]
                fb.database().ref().update(updates).then(() => {
                    //тут отправить в главное меню
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                            console.log(err)
                        })
                    }
                    bot.sendMessage(chatId, 'Теперь ваш баланс: ' + user_coins[chatId] + '. ' + emailalreadyadded_text).then(() => {
                        Reset(chatId)
                        anotherpoint_multiple[chatId] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                    })
                })
            } */
        })
    }

    if (msg.text === dont_add_email){
        isMakingChanges[chatId] = 0
        //теперь можно совершать новые покупки, но ты регистеред

        let updates = {};
        updates['Delivery/clients/' + msg.chat.id + '/coins'] = user_coins[chatId]
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chatId, didntaddemail_text).then(() => {
                Reset(chatId)
                anotherpoint_multiple[chatId] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
            })
        })

    }

    if (msg.text === declineorder_button){
        let updates = {}
        updates[order_name[chatId]] = null
        bot.deleteMessage(chatId, msg.message_id)
        fb.database().ref().update(updates).then(() => {
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendMessage(chatId, 'Жаль, что вы решили отменить заказ 😢').then(() => {
                Reset(chatId)
                anotherpoint_multiple[chatId] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
            })
        }).catch(err => {
            console.log(err)
        })
    }
})

bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message

    console.log(query.data)
    console.log(query.message.message_id)

    if (chat.id !== delivery_chat && chat.id !== admin_id){ 

    current_chat = chat.id
    if (query.data === query_deletethismessage){
        bot.deleteMessage(chat.id, message_id)
    }

    if (query.data === choosecity_text){
        userPoint[chat.id] = ''
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
        if (userCity[chat.id] === 0){
            let minus = 1
            if (userFood !== undefined){
                console.log('Убираем клавиатуру в конце покупки при смене заведения ' + userFood + '  ' + userFoodlist[chat.id])
                userFood = undefined
                userFoodlist[chat.id] = []
                minus = 2
                anotherpoint_multiple[chat.id] = 3
                basket[chat.id] = []
            }
            userPoint[chat.id] = ''
            const textmsg = `Вы выбрали <b>Нур-Султан</b>. Выберите, в каком заведении хотите сделать заказ, или отправьте его локацию:`
            console.log('message to delete: ' + temp_message[chat.id])
            for (let i = 0; i < 100; i++){
                bot.deleteMessage(chat.id, message_id - i - 1).then(() => {
                    console.log('MESSAGE FOUND. LOL ')
                    i = 101
                }).catch(error => {
                    console.log('MESSAGE NOT FOUND. MINUS++ ' + error)
                    minus++
                })
            }       
            if (anotherpoint_multiple[chat.id] !== 0){
                //
                for (let i = 0; i < 100; i++){
                    bot.deleteMessage(chat.id, message_id - i - 1).then(() => {
                        console.log('2 MESSAGE FOUND. LOL ')
                        anotherpoint_multiple[chat.id] = 0
                        i = 101
                    }).catch(error => {
                        console.log('2 MESSAGE NOT FOUND. MINUS++ ' + error)
                        anotherpoint_multiple[chat.id]++
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
        if (userCity[chat.id] === 1){
            userPoint[chat.id] = ''
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
        anotherpoint_multiple[chat.id] = 2
        keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], categories_count[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
    }

    for (let i = 0; i < userCategories[chat.id].length; i++){
        //console.log(userCategories[chat.id][i])
        if (query.data === userCategories[chat.id][i]){
            userCategory[chat.id] = i
            keyboards.FoodKeyboard(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, choosefood_text)
        }
    }
    for (let i = 0; i < userFoodlist[chat.id].length; i++){
        if (query.data === userFoodlist[chat.id][i]){
            //console.log('Кнопку нашли')
            userFood = i
            let food_photo_link = ''
            let food_description = ''
            temp_food_price[chat.id] = ''
            bot.deleteMessage(chat.id, message_id).then(() => {
                let food_photo = fb.database().ref('Delivery/ordering/categories/' + userCategory[chat.id] + '/food/' + i)
                food_photo.get().then((snapshot) =>
                {
                    food_photo_link = snapshot.val().photo
                    food_description = snapshot.val().description
                    temp_food_price[chat.id] = snapshot.val().price

                    if (food_photo_link !== '' && food_description !== '' && temp_food_price[chat.id] !== ''){
                        bot.sendPhoto(chat.id, food_photo_link).then(() => {
                            temp_food_text[chat.id] = `<b>` + userFoodlist[chat.id][userFood] + `</b>
` + food_description + `

<b> 💰 Цена: </b>` + temp_food_price[chat.id] + ` тенге`
                            for (let i = 0; i < basket[chat.id].length; i++){
                                if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood]){
                                    console.log('foundfood ' + i)
                                    bot.sendMessage(chat.id, temp_food_text[chat.id], {
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
                                if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood]){
                                    console.log('еду не нашли ' + i)
                                    bot.sendMessage(chat.id, temp_food_text[chat.id], {
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
                            if (basket[chat.id].length === 0){
                                console.log('корзина пустая')
                                    bot.sendMessage(chat.id, temp_food_text[chat.id], {
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
        /* bot.editMessageText(choosecategory_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:category_keyboard[chat.id]

                }
            }) */
        bot.deleteMessage(chat.id, message_id)
        keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], categories_count[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
    }
    if (query.data === anotherfood_text){
        /* bot.editMessageText(choosefood_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id, //!!!! НЕ ТОТ МЕССЕДЖ ID УДАЛЯЕМ
                reply_markup:{
                    inline_keyboard:foodlist_keyboard[chat.id]
                }
            }) */
        bot.deleteMessage(chat.id, message_id - 1)
        keyboards.FoodKeyboard(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, choosefood_text)

    }
    if (query.data === anotherfood_text2){
        /* bot.editMessageText(choosefood_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id, //!!!! НЕ ТОТ МЕССЕДЖ ID УДАЛЯЕМ
                reply_markup:{
                    inline_keyboard:foodlist_keyboard[chat.id]
                }
            }) */
            keyboards.FoodKeyboard(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, choosefood_text)

        //bot.deleteMessage(chat.id, message_id - 1)
    }
    if (query.data === addto_basket_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }) //убираем клаву в описании блюда
        for (let i = 0; i < basket[chat.id].length; i++){
            console.log('!!!! ' + basket[chat.id][i][0] + ' ' + userFoodlist[chat.id][userFood])
            if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood]){

                bot.sendMessage(chat.id, chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_food_price[chat.id] + 'тг.'), {
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
            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood]){
                //когда мы проверили все ячейки и ни одна не совпала...
                console.log('ALARM2: ' + i + ' ' + basket[chat.id].length)
                /*if (i === basket[chat.id].length){
                    bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id] + 'тг.'), {
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
                temp_foodamount[chat.id] = 1
                bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id] + 'тг.'), {
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
        if (basket[chat.id].length === 0){
            //когда мы проверили все ячейки и ни одна не совпала...
            bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id] + 'тг.'), {
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
            for (let i = 0; i < basket[chat.id].length; i++){
                console.log('226 ' + basket[chat.id][i][0] + ' ' + userFoodlist[chat.id][userFood])
                if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood]){
                    basket[chat.id][i][1]++
                    console.log('increasing existing food postion +1 ' + basket[chat.id][i][1])
                    bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_food_price[chat.id]) + 'тг.', {
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
                if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood]){
                    console.log('227 ' + basket[chat.id][i][0] + ' ' + userFoodlist[chat.id][userFood])
                    temp_foodamount[chat.id]++
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id]) + 'тг.', {
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
            if (basket[chat.id].length === 0){
                temp_foodamount[chat.id]++
                bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id]) + 'тг.', {
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
            for (let i = 0; i < basket[chat.id].length; i++){
                if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood]){
                    if (basket[chat.id][i][1] > 1){
                        basket[chat.id][i][1]--
                        bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_food_price[chat.id]) + 'тг.', {
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
                    /*if (i === basket[chat.id].length){
                        if (temp_foodamount[chat.id] > 1){
                            temp_foodamount[chat.id]--
                            bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id]) + 'тг.', {
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

                    if (temp_foodamount[chat.id] > 1){
                        temp_foodamount[chat.id]--
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id]) + 'тг.', {
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
            if (basket[chat.id].length === 0){
                if (temp_foodamount[chat.id] > 1){
                    temp_foodamount[chat.id]--
                    bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id]) + 'тг.', {
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
            console.log('Увеличиваем: ' + basket[chat.id][temp_backet_food[chat.id]][0])
            basket[chat.id][temp_backet_food[chat.id]][1]++
            bot.editMessageText(chooseamountoffood_text + basket[chat.id][temp_backet_food[chat.id]][1] + ' x ' + basket[chat.id][temp_backet_food[chat.id]][2] + 'тг. = ' + (basket[chat.id][temp_backet_food[chat.id]][1] * basket[chat.id][temp_backet_food[chat.id]][2]) + 'тг.', {
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
            console.log('Уменьшаем: ' + basket[chat.id][temp_backet_food[chat.id]][0])
            basket[chat.id][temp_backet_food][1]--
            bot.editMessageText(chooseamountoffood_text + basket[chat.id][temp_backet_food[chat.id]][1] + ' x ' + basket[chat.id][temp_backet_food[chat.id]][2] + 'тг. = ' + (basket[chat.id][temp_backet_food[chat.id]][1] * basket[chat.id][temp_backet_food[chat.id]][2]) + 'тг.', {
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
        for (let i = 0; i < basket[chat.id].length; i++){
            if (userFoodlist[chat.id][userFood] === basket[chat.id][i][0]){
                basket[chat.id].splice(i, 1)
                console.log('DELETED')
                //тут можно выводить список если удаляем предмет, а если еще не добавляли то нет
            }
        }
        bot.deleteMessage(chat.id, message_id).then(() => {
            bot.editMessageText(temp_food_text[chat.id], {
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
        console.log('!!!!!!!! ' + userFoodlist[chat.id] + '   ' + userFoodlist[chat.id][userFood])
        for (let i = 0; i < basket[chat.id].length; i++){
            console.log('0.1')
            if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood]){
                console.log('1')
              //  let newfood = [userFoodlist[chat.id][userFood], temp_foodamount[chat.id], temp_food_price[chat.id]]
             //   basket[chat.id][i] = newfood
                bot.deleteMessage(chat.id, message_id)
                bot.deleteMessage(chat.id, message_id - 1)
                bot.deleteMessage(chat.id, message_id - 2).then(() => {
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    for (let i = 0; i < basket[chat.id].length; i++){
                        finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                        if (i === basket[chat.id].length - 1){
                            editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                            console.log(finalsum + ' ' + i)
                            finalprice[chat.id] = finalsum + delivery_price
                            for (let i = 0; i < basket[chat.id].length; i++){
                                console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                                editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                                if (i === basket[chat.id].length - 1){
                                    console.log('2Блюдо: ')
                                    bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
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
                                                    text: location_text
                                                },{
                                                    text: phone_text
                                                }]
                                            ],
                                            resize_keyboard: true
        
                                        }
                                    }).then(() => {
                                        console.log('ОТПРАВИЛИ СООБЩЕНИЕ')
                                        
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
                                        }).then(()=>{
                                            buttons_message[chat.id] = query.message.message_id
                                            console.log('& ' + buttons_message[chat.id])
                                        })
                                    }).catch(err => {
                                        console.log(err)
                                    })
        
                                }
                            }
                        }
                    }
                    
                })
                break
            }
            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood]) {
                console.log(userFoodlist[chat.id][userFood] + ' ' + temp_foodamount[chat.id] + ' ' + temp_food_price[chat.id])
                let newfood = [userFoodlist[chat.id][userFood], temp_foodamount[chat.id], temp_food_price[chat.id], userCategory[chat.id]]
                basket[chat.id].push(newfood)
                temp_foodamount[chat.id] = 1
                bot.deleteMessage(chat.id, message_id)
                bot.deleteMessage(chat.id, message_id - 1)
                bot.deleteMessage(chat.id, message_id - 2).then(() => {
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    
                    for (let i = 0; i < basket[chat.id].length; i++){
                        finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                        if (i === basket[chat.id].length - 1){
                            editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                            console.log(finalsum + ' ' + i)
                            finalprice[chat.id] = finalsum + delivery_price
                            for (let i = 0; i < basket[chat.id].length; i++){
                                console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                                editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                                if (i === basket[chat.id].length - 1){
                                    console.log('2Блюдо: ')
                                    if (userstatus[chat.id] === 'registered'){
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
                                            }).then(()=>{
                                                buttons_message[chat.id] = query.message.message_id
                                                console.log('& ' + buttons_message[chat.id])
                                            })
                                        })
                                    }
                                    if (userstatus[chat.id] === 'unregistered' || userstatus[chat.id] === 'unknown'){
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
                                            }).then(()=>{
                                                buttons_message[chat.id] = query.message.message_id
                                                console.log('& ' + buttons_message[chat.id])
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
        if (basket[chat.id].length === 0){
            console.log('3')
            let newfood = [userFoodlist[chat.id][userFood], temp_foodamount[chat.id], temp_food_price[chat.id], userCategory[chat.id]]
            basket[chat.id].push(newfood)
            bot.deleteMessage(chat.id, message_id)
            bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id - 2).then(() => {
                let editmsg = `Ваш заказ: `
                let finalsum = 0 
                    for (let i = 0; i < basket[chat.id].length; i++){
                        finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                        editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                        finalprice[chat.id] = finalsum + delivery_price
                        for (let i = 0; i < basket[chat.id].length; i++){
                            console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                            editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                            if (i === basket[chat.id].length - 1){
                                console.log('2Блюдо: userstatus[chat.id]: ' + userstatus[chat.id] + ', ' + chat.id)
                                if (userstatus[chat.id] === 'registered'){
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
                                        }).then(()=>{
                                            buttons_message[chat.id] = query.message.message_id
                                            console.log('& ' + buttons_message[chat.id])
                                        })
                                    })
                                }
                                
                                if (userstatus[chat.id] === 'unregistered' || userstatus[chat.id] === 'unknown'){
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
                                        }).then(()=>{
                                            buttons_message[chat.id] = query.message.message_id
                                            console.log('& ' + buttons_message[chat.id])
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
            let line_amount = 1 + Math.floor(basket[chat.id].length / 4)
            let lastbuttons_amount = basket[chat.id].length - ((line_amount - 1) * 4)
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
            temp_backet_food[chat.id] = i
            console.log('pressed button is: ' + i)
            bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_food_price[chat.id] + 'тг.'), {
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
        //const index = basket[chat.id].indexOf(temp_backet_food)
        let basket2 = basket[chat.id]
        console.log('!!!!   '  + temp_backet_food[chat.id])
        
        for (let i = 0; i < basket[chat.id].length; i++){
            //пока не нашли элемент для удаления, можно ничего не делать
            /*if (i < temp_backet_food){
                basket[chat.id][i] = basket2[i]
            }*/
            if (i >= temp_backet_food[chat.id]){
                if (basket2[i+1] !== undefined){
                    console.log('BASKET2: ' + basket2[i+1])
                    basket[chat.id][i] = basket2[i+1]
                }
                else {
                    //удаляем последний элемент нашего массива
                    console.log('BASKET22: ' + basket2[i+1])
                    basket[chat.id].splice(i, 1)
                }
                
            }
        }
        bot.deleteMessage(chat.id, message_id).then(() => {
            if (basket[chat.id].length > 0){
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chat.id].length; i++){
                    finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                    if (i === basket[chat.id].length - 1){
                        editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                        console.log(finalsum + ' ' + i)
                        finalprice[chat.id] = finalsum + delivery_price
                        for (let i = 0; i < basket[chat.id].length; i++){
                            console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                            editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                            if (i === basket[chat.id].length - 1){
                                console.log('2Блюдо: ')
                                if (userstatus[chat.id] === 'registered'){
                                    bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
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
                                        }).then(()=>{
                                            buttons_message[chat.id] = query.message.message_id
                                            console.log('& ' + buttons_message[chat.id])
                                        })
                                    })
                                }
                                if (userstatus[chat.id] === 'unknown' || userstatus[chat.id] === 'unregistered'){
                                    bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
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
                                        }).then(()=>{
                                            buttons_message[chat.id] = query.message.message_id
                                            console.log('& ' + buttons_message[chat.id])
                                        })
                                    })
                                }
    
                            }
                        }
                    }
                }
            }
            else {
                finalprice[chat.id] = 0
                bot.sendMessage(chat.id,  basketisempty_text, {
                    reply_markup:{
                        inline_keyboard: [
                            [{
                                text: anotherfood_text2,
                                callback_data: anotherfood_text2
                            }]
                        ]
                    }
                }).then(()=>{
                    buttons_message[chat.id] = query.message.message_id
                    console.log('& ' + buttons_message[chat.id])
                })
            }
        })
    }
    if (query.data === addto_basket_text3) {
        bot.deleteMessage(chat.id, message_id).then(() => {
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket[chat.id].length; i++){
                finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                if (i === basket[chat.id].length - 1){
                    editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                    finalprice[chat.id] = finalsum + delivery_price
                    console.log(finalsum + ' ' + i)
                    for (let i = 0; i < basket[chat.id].length; i++){
                        console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                        editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                        if (i === basket[chat.id].length - 1){
                            console.log('2Блюдо: ')
                            if (userstatus[chat.id] === 'unknown' || userstatus[chat.id] === 'unregistered'){
                                bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
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
                                    }).then(()=>{
                                        buttons_message[chat.id] = query.message.message_id
                                        console.log('& ' + buttons_message[chat.id])
                                    })
                                })
                            }
                            if (userstatus[chat.id] === 'registered'){
                                bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
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
                                    }).then(()=>{
                                        buttons_message[chat.id] = query.message.message_id
                                        console.log('& ' + buttons_message[chat.id])
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
                finalbasket[chat.id] + `
Заберу через ` + finaltime_deelay + ` минут после оплаты`,
                'payload',
                '410694247:TEST:38d2953c-db26-49b8-9b7e-f7661917eb89',
                'RANDOM_KEY',
                'KZT',
                [{
                    label: 'Оплата заказа ' + chat.username,
                    amount: finalprice[chat.id] * 100,
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
        isMakingChanges[chat.id] = 1
        bot.editMessageText('🙂 Введите свое имя, так курьеру будет проще найти Вас:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }
    if (query.data === changephone_text){
        isMakingChanges[chat.id] = 2
        bot.editMessageText('📞 Введите свой номер, чтобы курьер мог связаться с Вами в случае необходимости:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }
    if (query.data === changeadress_text){
        isMakingChanges[chat.id] = 3
        bot.editMessageText('📍 Введите адрес доставки в формате Улица, Дом, Квартира, Этаж:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }

    if (query.data === changeamountof_persons){
        isMakingChanges_2[chat.id] = 1
        bot.editMessageText('👥 Введите количество персон: ', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
        })
    }
    if (query.data === changepaying_method){
        //isMakingChanges_2[chat.id] = 2
        bot.editMessageText('💳 Выберите способ оплаты', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Наличными курьеру',
                        callback_data: /* user_payingmethod[chat.id].toString() + */ 'Наличными курьеру'
                    }],
                    [{
                        text: 'Безналичными курьеру',
                        callback_data: /* user_payingmethod[chat.id].toString() +  */'Безналичными курьеру'
                    }]
                ]
            }
        })
    }

    if (query.data === /* user_payingmethod[chat.id] +  */'Наличными курьеру' || query.data === /* user_payingmethod[chat.id] + */ 'Безналичными курьеру'){
        if (query.data === /* user_payingmethod[chat.id] + */ 'Наличными курьеру'){
            user_payingmethod[chat.id] = 'Наличными курьеру'

            bot.editMessageText(dopblank_text, {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Кол-во персон: ' + user_personsamount[current_chat],
                            callback_data: changeamountof_persons
                        }],
                        [{
                            text: 'Когда доставить: ' + user_deliverdate[current_chat],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: 'Способ оплаты: ' + user_payingmethod[current_chat],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            })
        }

        else if (query.data === /* user_payingmethod[chat.id] + */ 'Безналичными курьеру'){
            user_payingmethod[chat.id] = 'Безналичными курьеру'

            bot.editMessageText(dopblank_text, {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Кол-во персон: ' + user_personsamount[current_chat],
                            callback_data: changeamountof_persons
                        }],
                        [{
                            text: 'Когда доставить: ' + user_deliverdate[current_chat],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: 'Способ оплаты: ' + user_payingmethod[current_chat],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            })
        }
    }

    if (query.data === changedeliver_date){
        isMakingChanges_2[chat.id] = 2
        bot.editMessageText('⏰ Укажите, когда вам нужно доставить заказ: ', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
        })
    }

    if (query.data === dataiscorrect_text){
        bot.editMessageText(dopblank_text, {
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Кол-во персон: ' + user_personsamount[chat.id],
                        callback_data: changeamountof_persons
                    }],
                    [{
                        text: 'Когда доставить: ' + user_deliverdate[chat.id],
                        callback_data: changedeliver_date
                    }],
                    [{
                        text: 'Способ оплаты: ' + user_payingmethod[chat.id],
                        callback_data: changepaying_method
                    }],
                    [{
                        text: dataiscorrect_text,
                        callback_data: dataiscorrect2_text
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[chat.id] = message_id
            console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
        })
        
    }

    if (query.data === dataiscorrect2_text){
        if (user_payingmethod[chat.id] === 'Наличными курьеру'){
            isMakingChanges_2[chat.id] = 3
            bot.editMessageText('Напишите, с какой суммы вы хотите получить сдачу: ', {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: no_sdacha_text,
                            callback_data: no_sdacha_text
                        }]
                    ]
                }
            })
        }
        else {
            isMakingChanges_2[chat.id] = 4
            user_sdachainfo[chat.id] = no_sdacha_text
            bot.editMessageText('Уточните, как курьер может до вас добраться: ', {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: no_howtocome_text,
                            callback_data: no_howtocome_text
                        }]
                    ]
                }
            })
        }
        
    }

    if (query.data === no_sdacha_text){
        isMakingChanges_2[chat.id] = 4
        user_sdachainfo[chat.id] = no_sdacha_text
        bot.editMessageText('Уточните, как курьер может до вас добраться: ', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: no_howtocome_text,
                        callback_data: no_howtocome_text
                    }]
                ]
            }
        })
    }
    if (query.data === no_howtocome_text){
        isMakingChanges_2[chat.id] = 0
        isMakingChanges_3[chat.id] = 0
        isMakingChanges[chat.id] = 0
        user_howtocome[chat.id] = 'Не указано'
        if (userstatus[chat.id] !== 'unregistered'){
            if (user_coins[chat.id] >= (finalprice[chat.id] * min_pay_percentage)){
                if (user_coins[chat.id] <= (finalprice[chat.id] * max_pay_percentage)){
                    //тут можно оплатить всеми баллами.
                    skidka[chat.id] = user_coins[chat.id]
                    bot.sendMessage(chat.id, 'У вас есть ' + user_coins[chat.id] + ' тенге, которыми можно оплатить заказ. Сумма заказа с учетом скидки: ' + (finalprice[chat.id]-user_coins[chat.id]) + ' тенге. Хотите потратить их сейчас?', {
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
                else if (user_coins[chat.id] > (finalprice[chat.id] * max_pay_percentage)){
                    //тут оплачиваем максимальным количеством баллов
                    skidka[chat.id] = finalprice[chat.id] * max_pay_percentage
                    bot.sendMessage(chat.id, 'Ваш баланс: ' + user_coins[chat.id] + ' тенге. Вы можете потратить ' + finalprice[chat.id] * max_pay_percentage + 'тенге на оплату заказа. Сумма заказа с учетом скидки: ' + (finalprice[chat.id] - ( finalprice[chat.id] * max_pay_percentage)) + ' тенге. Хотите сделать это?', {
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
                skidka[chat.id] = 0
             bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (alltime_purchases_amount[chat.id] > 0){
                    alltimepurchases[chat.id] = alltime_purchases_amount[chat.id] + 1
                }

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_food[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chat.id] = 'Delivery/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = date_now.toString()
                
                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: order_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date[chat.id]
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date[chat.id]
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id]).then(() => {
        
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
        else {
            bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })

                let updates = {};

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (alltime_purchases_amount[chat.id] > 0){
                    alltimepurchases[chat.id] = alltime_purchases_amount[chat.id] + 1
                }
                

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_food[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chat.id] = 'Delivery/bills/' + date_now.toString()
                order_date[chat.id] = date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])

                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: order_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    console.log('WARNING! ' + userstatus[chat.id])
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates[order_name[chat.id]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder() 
                    
                }).catch(err => {
                    console.log('error: ' + err)
                })

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = Astana_date.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = Astana_date.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
    
    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`

    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])

    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date[chat.id]
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date[chat.id]
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id])
        /* let update = {}
        let bill_message_id = query.message.message_id
        console.log('bills message id: ' + bill_message_id)
        update['Delivery/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
        console.log('adding message id: ' + 'Delivery/bills/' + order_date) */
    }).catch(err => {
        console.log('error: ' + err)
    })

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
    }
    if (query.data === spendmycoins){
        skidka[chat.id] = Math.round(skidka[chat.id])
        finalprice[chat.id] = finalprice[chat.id] - skidka[chat.id]
        finalprice[chat.id] = Math.round(finalprice[chat.id])
        user_coins[chat.id] -= skidka[chat.id]
        user_coins[chat.id] = Math.round(user_coins[chat.id])
        finalbasket[chat.id] += `

Цена с учетом скидки: ` + finalprice[chat.id] + ' тг.'

        bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })

                let updates = {}

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (alltime_purchases_amount[chat.id] > 0){
                    alltimepurchases[chat.id] = alltime_purchases_amount[chat.id] + 1
                }

                //console.log(user_adress[chat.id] + ' ' + average_price[chat.id] + ' ' + average_purchases[chat.id] + ' ' + user_coins[chat.id] + ' ' + user_email[chat.id] + ' ' + favourite_food + ' ' + chat.id + ' ' + user_name[chat.id] + ' ' + user_phone[chat.id] + ' ' + username[chat.id] + ' ' + alltimepurchases[chat.id])

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_food[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chat.id] = 'Delivery/bills/' + date_now.toString()
                order_date[chat.id] = date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: order_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                }).catch(error => {
                    console.log(error)
                })

                                ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)  
    
deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date[chat.id]
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date[chat.id]
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id])
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
        skidka[chat.id] = 0
        bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (alltime_purchases_amount[chat.id] > 0){
                    alltimepurchases[chat.id] = alltime_purchases_amount[chat.id] + 1
                }

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_food[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chat.id] = 'Delivery/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = date_now.toString()
                
                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: order_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Delivery/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Delivery/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Delivery/clients/' + chat.id] = newuser
                    updates['Delivery/bills/' + date_now] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

    deliver_bill_topic = deliver_bill_topic_names[0]
    deliver_bill_client_info = `

<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    deliver_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat, delivers_bill, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard:[
                [{
                    text: '✅ Принять заказ',
                    callback_data: accept_order_callback + order_date[chat.id]
                }],
                [{
                    text: '❌ Отклонить заказ',
                    callback_data: refuse_order_callback + order_date[chat.id]
                }]
            ]
        }
    }).then(() => {
        //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id]).then(() => {
        
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
        isMakingChanges[chat.id] = 4
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
        isMakingChanges[chat.id] = 0

        let updates = {};
        updates['Delivery/clients/' + chat.id + '/coins'] = user_coins[chat.id]
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chat.id, didntaddemail_text).then(() => {
                Reset(chat.id)
                anotherpoint_multiple[chat.id] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], categories_count[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
            })
        })
    }  
    if (query.data === dontleavecomment){
        let orderinfo = fb.database().ref(order_name[chat.id]);
        orderinfo.get().then((snapshot) => 
        {
            console.log('saving poll...')
            let updates = {}
            let bill_update = {
                adress: snapshot.val().adress,
                client_name: snapshot.val().client_name,
                date_ordered: snapshot.val().date_ordered,
                client_id: snapshot.val().client_id,
                order_info: snapshot.val().order_info,
                phone: snapshot.val().phone,
                price: snapshot.val().price,
                order_status: snapshot.val().order_status,
                deliver_name: snapshot.val().deliver_name,
                accept_date: snapshot.val().accept_date,
                deliver_id: snapshot.val().deliver_id,
                message_id: snapshot.val().message_id,
                delivered_date: snapshot.val().delivered_date,
                feedback: feedback_options[answered_feedback[chat.id]],
                bill_text: snapshot.val().bill_text,
                user_personsamount: snapshot.val().user_personsamount,
                user_payingmethod: snapshot.val().user_payingmethod,
                user_deliverdate: snapshot.val().user_deliverdate,
                user_sdachainfo: snapshot.val().user_sdachainfo,
                user_howtocome: snapshot.val().user_howtocome
            }
            updates[order_name[chat.id]] = bill_update
            updates['Delivery/clients/' + chat.id + '/coins'] = user_coins[chat.id]
            fb.database().ref().update(updates).then(() => {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, query.message.message_id - i).catch(err => {
                        console.log(err)
                    })
                }

                let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
└ Оценка клиента: ` + feedback_options[answered_feedback[chat.id]]
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: delivery_chat,
                        message_id: snapshot.val().message_id
                    })
                bot.sendSticker(chat.id, sticker_hello).then(() => {
                    Reset(chat.id)
                    anotherpoint_multiple[chat.id] = 2
                    keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], categories_count[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                })
            })
        }) 
    }
    if (query.data === leavecomment){
        bot.editMessageText('💬 Напишите отзыв:', {
            chat_id: chat.id,
            message_id: message_id
        }).then(() => {
            buttons_message[chat.id] = message_id
            isMakingChanges[chat.id] = 5
        })/* .catch(err => {
            bot.editMessageText('💬 Напишите отзыв:', {
                chat_id: chat.id,
                message_id: message_id - 1
            }).then(() => {
                buttons_message[chat.id] = message_id - 1
                isMakingChanges[chat.id] = 5
            }).catch(err2 => {
                bot.editMessageText('💬 Напишите отзыв:', {
                    chat_id: chat.id,
                    message_id: message_id - 2
                }).then(() => {
                    buttons_message[chat.id] = message_id - 2
                    isMakingChanges[chat.id] = 5
                }).catch(err3 => {
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chat.id, message_id - i).catch(smth => {
                            //console.log(smth)
                        })
                    }
                    bot.sendSticker(chat.id, sticker_hello).then(() => {
                        Reset(chat.id)
                        anotherpoint_multiple[chat.id] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], categories_count[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                    })
                })
            })
        }) */
        
    }
    }

    if (chat.id === delivery_chat){
    let userdata = fb.database().ref('Delivery/bills/')
    userdata.get().then((result) => {
        let bills_array = Object.keys(result.val())
        console.log('Вы нажимаете на кнопку callback для доставщиков: ' + query.data + ', array = ' + bills_array.length)
        for(let i = bills_array.length - 1; i >= 0; i--){
            console.log(i + ' Processing... ' + query.data + ', ' + (accept_order_callback + bills_array[i]))
            if (query.data === accept_order_callback + bills_array[i].toString()){
                accepted_order_name = bills_array[i]
                console.log('Вы приняли заказ: ' + accepted_order_name)
                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                let orderinfo = fb.database().ref('Delivery/bills/' + bills_array[i]);
                orderinfo.get().then((snapshot) => 
                {
                    console.log(query)
                    console.log('deliverer name2 : ' + query.message.from.first_name + ', ' + query.message.from.id)
                    let accept_date = new Date().getTime()
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
                        deliver_id: query.from.id.toString(),
                        message_id: query.message.message_id,
                        user_personsamount: snapshot.val().user_personsamount,
                        user_payingmethod: snapshot.val().user_payingmethod,
                        user_deliverdate: snapshot.val().user_deliverdate,
                        user_sdachainfo: snapshot.val().user_sdachainfo,
                        user_howtocome: snapshot.val().user_howtocome
                    }
                    updates['Delivery/bills/' + bills_array[i]] = order_update
                    //updates['Delivery/clients/CLIENTID/EGO_CHECK'] = order_update
                    fb.database().ref().update(updates)

                    /////ИЗМЕНЯЕМ ЧЕК///////////////

                    let options = { weekday: 'short'}
                    let Astana_date = new Date(snapshot.val().date_ordered)
                    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

                    let Astana_date_accept = new Date(accept_date)  
                    let minutes2 = Astana_date_accept.getMinutes()
                    if (minutes2 < 10) minutes2 = '0' + minutes2
                    let hours2 = Astana_date.getHours()
                    if (hours2 < 10) hours2 = '0' + hours2
                    let visible_date_accept = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' + hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1)                                   

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
                
                    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
├ Дата заказа: ` + visible_date + `
├ Дата принятия заказа: ` + visible_date_accept + `
└ Имя работника: ` + query.from.first_name.toString() + `, id: `+ query.from.id.toString() + `
`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + snapshot.val().user_personsamount + `
├ Способ оплаты: ` + snapshot.val().user_payingmethod + `
├ Купюра оплаты: ` + snapshot.val().user_sdachainfo + `
└ Когда доставить: ` + snapshot.val().user_deliverdate + `

<b>🚴‍♂️ Как пройти?</b>
` + snapshot.val().user_howtocome + `

`

delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
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
                break
            }
            else if (query.data === refuse_order_callback + bills_array[i]){
                console.log('Вы отклонили заказ: ' + bills_array[i])
                let orderinfo = fb.database().ref('Delivery/bills/' + bills_array[i]);
                orderinfo.get().then((snapshot) => 
                {
                    let refuse_date = new Date().getTime()
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
                        deliver_id: query.from.id.toString(),
                        message_id: query.message.message_id,
                        user_personsamount: snapshot.val().user_personsamount,
                        user_payingmethod: snapshot.val().user_payingmethod,
                        user_deliverdate: snapshot.val().user_deliverdate,
                        user_sdachainfo: snapshot.val().user_sdachainfo,
                        user_howtocome: snapshot.val().user_howtocome,
                        
                    }
                    updates['Delivery/bills/' + bills_array[i]] = order_update
                    //updates['Delivery/clients/CLIENTID/EGO_CHECK'] = order_update
                    fb.database().ref().update(updates)

                    /////ИЗМЕНЯЕМ ЧЕК///////////////
                    let options = { weekday: 'short'}
                    let Astana_date = new Date(snapshot.val().date_ordered)
                    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

let Astana_date_accept = new Date(refuse_date)
let minutes2 = Astana_date_accept.getMinutes()
if (minutes2 < 10) minutes2 = '0' + minutes2
let hours2 = Astana_date_accept.getHours()
if (hours2 < 10) hours2 = '0' + hours2
let visible_date_refuse = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' + hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1)                                   

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
                
                    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
├ Дата заказа: ` + visible_date + `
├ Дата отказа от заказа: ` + visible_date_refuse + `
└ Имя работника: ` + query.from.first_name.toString() + `, id: `+ query.from.id.toString() + `
`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + snapshot.val().user_personsamount + `
├ Способ оплаты: ` + snapshot.val().user_payingmethod + `
├ Купюра оплаты: ` + snapshot.val().user_sdachainfo + `
└ Когда доставить: ` + snapshot.val().user_deliverdate + `

<b>🚴‍♂️ Как пройти?</b>
` + snapshot.val().user_howtocome + `

`
delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
                    bot.editMessageText(delivers_bill, {
                        parse_mode: 'HTML',
                        chat_id: query.message.chat.id,
                        message_id: query.message.message_id,
                    })
                })
                break 
            }
            else if (query.data === isdelivered_callback + bills_array[i]){
                accepted_order_name = bills_array[i]
                console.log('Вы доставили заказ: ' + accepted_order_name)
                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                let orderinfo = fb.database().ref('Delivery/bills/' + bills_array[i]);
                orderinfo.get().then((snapshot) => 
                {
                    if (query.from.id.toString() === snapshot.val().deliver_id){
                        let delivered_date = new Date().getTime()
                        //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
    
                        /////ИЗМЕНЯЕМ ЧЕК///////////////
                        let options = { weekday: 'short'}
                        let Astana_date = new Date(snapshot.val().date_ordered)
                        
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' + hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

let Astana_date_accept = new Date(snapshot.val().accept_date)  
let minutes2 = Astana_date_accept.getMinutes()
if (minutes2 < 10) minutes2 = '0' + minutes2
let hours2 = Astana_date_accept.getHours()
if (hours2 < 10) hours2 = '0' + hours2
let visible_date_accept = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' + hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1)                                   


let Astana_date_delivered = new Date(delivered_date)  
let minutes3 = Astana_date_delivered.getMinutes()
if (minutes3 < 10) minutes3 = '0' + minutes3
let hours3 = Astana_date_accept.getHours()
if (hours3 < 10) hours3 = '0' + hours3
let visible_date_delivered = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_delivered) + ' ' + hours3 + ':' + minutes3 + ', ' + Astana_date_delivered.getDate() + '.' + (Astana_date_delivered.getMonth() + 1)                                      
                        
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
         
                        deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан, GMT+6)
├ Дата заказа: ` + visible_date + `
├ Дата принятия заказа: ` + visible_date_accept + `
├ Дата доставки: ` + visible_date_delivered + `
└ Имя работника: ` + query.from.first_name.toString() + `, id: `+ query.from.id.toString() + `
`
                        deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + snapshot.val().user_personsamount + `
├ Способ оплаты: ` + snapshot.val().user_payingmethod + `
├ Купюра оплаты: ` + snapshot.val().user_sdachainfo + `
└ Когда доставить: ` + snapshot.val().user_deliverdate + `

<b>🚴‍♂️ Как пройти?</b>
` + snapshot.val().user_howtocome + `

`
delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
                        
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
                                message_id: query.message.message_id,
                                bill_text: delivers_bill,
                                user_personsamount: snapshot.val().user_personsamount,
                                user_payingmethod: snapshot.val().user_payingmethod,
                                user_deliverdate: snapshot.val().user_deliverdate,
                                user_sdachainfo: snapshot.val().user_sdachainfo,
                                user_howtocome: snapshot.val().user_howtocome
                            }
                            updates['Delivery/bills/' + bills_array[i]] = order_update
                            //updates['Delivery/clients/CLIENTID/EGO_CHECK'] = order_update
                            fb.database().ref().update(updates)

                            bot.editMessageText(delivers_bill, {
                            parse_mode: 'HTML',
                            chat_id: query.message.chat.id,
                            message_id: query.message.message_id,
                        })
                    }
                    
                })
                break
            }
            else if (i === 0) {
                console.log(i + 'HERE IT IS')
                bot.editMessageText('💭 Заказ не найден. Скорее всего, клиент его отменил', {
                    chat_id: chat.id,
                    message_id: message_id
                })
            }
        }
    })
    }
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
    Reset(current_chat)

    if (chatId !== delivery_chat){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello).then(() => {
            anotherpoint_multiple[chatId] = 2
            keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
        })
    }
    if (chatId === delivery_chat){
        bot.sendMessage(chatId, 'Привет! Я буду скидывать сюда заказы. Чтобы начать выполнять заказ, нажмите на кнопку "✅ Принять", под заказом. Так клиент поймет, что его заказ принят.')
    }
})

function Reset(current_chat){
    user_phone[current_chat] = ''
    user_email[current_chat] = 'unknown'
    user_adress[current_chat] = ''
    user_name[current_chat] = ''
    user_username[current_chat] = 'unknown'
    user_id[current_chat] = 0
    average_price[current_chat] = 0
    average_purchases[current_chat] = 0
    user_coins[current_chat] = 0
    added_coins[current_chat] = 0
    favourite_food[current_chat] = 'unknown'
    alltime_purchases_amount[current_chat] = 0
    userstatus[current_chat] = 'unknown'
    order_name[current_chat] = ''
    order_date[current_chat] = ''
    order_status[current_chat] = 'unknown'
    skidka[current_chat] = 0

    finalprice[current_chat] = 0
    finalbasket[current_chat] = ''
    temp_backet_food[current_chat] = 0
    temp_food_text[current_chat] = ''
    temp_food_price[current_chat] = 0
    temp_foodamount[current_chat] = 1

    basket[current_chat] = []

    food_categories[current_chat] = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]

    add_info_msg[current_chat] = 0

    anotherpoint_multiple[current_chat] = 0
    restaurant_name = 'Coffee BOOM'

    temp_message[current_chat] = 0
    userCity[current_chat] = 0 // 0-NurSultan, 1-Almaty
    userPoint[current_chat] = 0
    //
    userCategory[current_chat] = 0
    userCategories[current_chat] = []
    category_keyboard[current_chat] = []
    categories_count[current_chat] = 0
    //
    userFood
    userFoodlist[current_chat] = []
    foodlist_keyboard[current_chat] = []
    foodlist_count[current_chat] = 0

    isMakingChanges[current_chat] = 0
    isMakingChanges_2[current_chat] = 0
    isMakingChanges_3[current_chat] = 0

    point_adress[current_chat] = ''

    userlocation[current_chat] = [0.1,0.1]
    nearest_place[current_chat] = 0
    min_distance[current_chat] = 9999999

    buttons_message[current_chat] = 0
    
    answered_feedback[current_chat] = 0
    isAnswered_feedback[current_chat] = 0

    user_personsamount[current_chat] = 1
    user_payingmethod[current_chat] = 'Наличными курьеру'
    user_deliverdate[current_chat] = 'Сейчас'
    user_howtocome[current_chat] = 'unknown'
    user_sdachainfo[current_chat] = 'unknown'
}

process.on('uncaughtException', function (err) {
    console.log('inxed: ' + err);
});