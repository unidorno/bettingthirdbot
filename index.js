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
const { reset } = require('nodemon')
const { captureRejectionSymbol } = require('node-telegram-bot-api')
const { chat } = require('googleapis/build/src/apis/chat')

const fb = firebase_connect.initializeApp({
    apiKey:'AIzaSyA0wSxSsB938N4mKpV5Nec0tBWbpPFyZAQ',
    authDomain:'upperrestaurant.firebaseapp.com',
    databaseURL: 'https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app'
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
let delivery_chat = []
let current_chat = 0

let temp_message = []
let userCity = [] // 0-NurSultan, 1-Almaty
let userCities = []
let userPoint = []
let userPoints = []
let cities_keyboard = []
let points_keyboard = []

let delcat_keyboard = []
let UserDelCats = []
let UserDelCat = []
let mother_link = 'https://t.me/ctos_deliverybot'
let choosecat_text = 'Выбери категорию заведения в котором ты хочешь сделать заказ:'

let cities_count = []
let points_count = []
//
let userCategory = []
let userCategories = []
let category_keyboard = []
let categories_count = []
//
let userFood = []
let userFoodlist = []
let foodlist_keyboard = []
let foodlist_count = []

let help_phone = []
let delivery_min_price = []
let delivery_price = []
let point_location = []
let point_adress = []
let point_disclaimer = []
let point_pplamount = []
let point_workingtime = []
let point_payment_options = []
let point_rating = []
let point_delivery_time = []

let isChangingPhone = []
let isChangingTime = []
let isChangingDelivery = []
let isCreatingCoupon = []
let isWritingCoupon = []

let isMailingMessage = []
let mailing_text = []
let mailing_mode = []
let mailing_categories = []
const sendmessage_cb = 'sndmlngmsg_cb'
let isAdmin = []

let coupondata = []

let keyboard_admin_delset = [['Мин. сумма заказа: ', 'chngdmcrd_cb'], ['Цена доставки: ', 'cngmcfio_cb'], ['Способы оплаты: ','cngkspnmbg_cb'], ['◀️ Назад', 'bcktopll_cb']]
let keyboard_admin_times = [['Часы работы: ', 'chngdmcrdwgg_cb'], ['◀️ Назад', 'bcktoplwefl_cb']]
let keyboard_admin_phone = [['Телефон: ', 'dlvrcntcts_cb'], ['Координаты ', 'dlvrpntadrs_cb'], ['Адрес: ', 'dlvrglctndt_cb'],['◀️ Назад', 'bcktopeglwefl_cb']]

/////////////////////////////////////////////////////////////////
let anotherpoint_multiple = []
let restaurant_name = ' '

const business_cbcs = ['htwrksrstf_cb', 'whryounthrs_cb', 'wrdlvrngtm', 'cgngcmpnm_cb', 'cngcmpph_cb', 'fnshflngnf_cb', 'strtchknrd_cb', 'abtnus_cb']
const openadminpanel = ['👥 Войти как админ', 'imadmng_cb']
const text_notadmin = ['Это был пранк, мы знаем что Вы не админ 🤣', 'Стоп, так Вы же не админ 😟', 'Написано же, кнопка для админа 😡']
const backtodopblank = ['◀️ Назад', 'bcktdpblnk_cb']
//const backfromdopblank = ['◀️ Назад', 'bckfrmdpblnk_cb']
const sendphone_point = ['📞 Позвонить', 'sndphnpt_cb']
const sendadress_point = ['📍 Адрес', 'sndadrss_cb']
const loadcategories = ['🛒 Сделать заказ', 'ldctgrs_cb']
const reallystartagain = ['Да, уверен', 'ysurewntstrtag_cb']
const backtoaskinfo = ['◀️ Назад', 'bcktsknf_cb']
const writecoupon = ['🛍 Ввести промокод', 'wrtprmcvd_cb']
const choosepoint_text = 'Выберите заведение, в котором хотите сделать заказ'
const youchosepoint_text = '🛒 Заказать здесь'
const anotherpoint_text = '◀️ Выбрать другое заведение'
const anotherusermode_text = '◀️ Выбрать другую услугу'
const anothercategory_text = '◀️ Выбрать другую категорию'
const choosecity_text = 'Для начала, найдите свой город:'
const change_delcat_text = '◀️ Выбрать другой тип заведения'
const hellomessage_text = `Привет! Я бот-доставщик Resify, с моей помощью ты можешь быстро и удобно заказать доставку из любимого места 🛒`
const youchosecafe_text = 'Вы выбрали заведение, которое находится по адресу: '
const sendlocation = '📍 Отметить на карте'
const choosecategory_text = 'Выберите категорию блюда, которое хотите заказать:'
const choosefood_text = 'Выберите блюдо, которое хотите заказать:'
const addto_basket_text = '✅ Добавить в корзину'
const changefoodamount_basket_text = '✏️ Изменить количество'
const addto_basket_text2 = 'Готово'
const addto_basket_text3 = 'Готово.'
const dont_addto_basket_text2 = '🗑 Удалить'
const anotherfood_text = '◀️ Назад к списку блюд'
const anotherfood_text2 = ['➕ Добавить', 'reqstsmthmr_cb']
const chooseamountoffood_text = 'Введите нужное количество: '
const editbasket_text = '✏️ Изменить'
const paybasket_text = ['✅ Сделать заказ', 'paybskttxt_cb']
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
const finish_order_text = ['✔️ Завершить', 'fnshrdrtxt_cb']
const orderonceagain_text = ['🔃 Заказать снова','ordrncgn_cb']
const add_email = '🔗 Добавить email'
const dont_add_email = 'Нет, спасибо'
const spendmycoins = 'Да, хочу'
const dontspendmycoins = 'Нет'
const declineorder_button = ['❌ Отменить заказ', 'dclnrdrbtn_cb']
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
const sticker_hello = 'CAACAgIAAxkBAAIRSmDvAUTpAQABWFdBhIj3i-e5owJFvQACbwAD29t-AAGZW1Coe5OAdCAE'
const sticker_indeliver = 'CAACAgIAAxkBAAIRS2DvAWDzsy4hZzwmGako8vqPx9nGAAJsAAPb234AAQJocymo-yvBIAQ'
const sticker_baddeliver = 'CAACAgIAAxkBAAIRTWDvAap8s0prOFF5df16YtUgm83IAAJjAAPb234AAYydBT3nQoPnIAQ'
const sticker_gooddeliver = 'CAACAgIAAxkBAAIRTGDvAXkkSdFxAy1piRH5NP2NXTydAAJmAAPb234AAZPMw9ANLY9sIAQ'
const openkeyboard_pic = 'https://storage.googleapis.com/upperrestaurant.appspot.com/Standards/howtoopen.jpg'

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
let user_mode = []
let usermodes = [['Доставка', 'delivery_menu'], ['Заказ на вынос', 'default_menu']]
let user_phone = []
let user_email = []
let user_adress = []
let user_name = []
let user_username = []
//let user_lastbill = []
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
let feedback_options = ['🤩', '😌', '😒']
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
let isWritingBusiness = []
///////////////////////////////////////////////////////

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

let message_toedit = []
let message_text = []
///////////////////////////////////////////////////////
let business_info = []

let unregistered_keyboard = []
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
        text: declineorder_button[0],
        callback_data: declineorder_button[1]
    }],
    [{
        text: sendphone_point[0],
        callback_data: sendphone_point[1]
    }]
]

let registered_keyboard = []

/* let date = new Date()
let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
let timeOfffset = 6 //Astana GMT +6
let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
let date_now = Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1) + ' (Нур-Султан GMT+6)' + '.' + Astana_date.getFullYear() + ',' + Astana_date.getHours() + ':' + Astana_date.getMinutes()
 *///console.log(new Date(Astana_date.getTime()).toString())
//let options = { weekday: 'short'}
//let date_now = new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1) + ' (Нур-Султан GMT+6)' + '.' + Astana_date.getFullYear() + ', ' + Astana_date.getHours() + ':' + Astana_date.getMinutes()

function StartCheckingOrder(chatId){
    let order_data = fb.database().ref(order_name[chatId])
    order_data.on('value', (result) => 
    {
        order_status[chatId] = result.val().order_status
        console.log('ORDER STATUS: ' + result.val().order_status + ', name: "' + order_name[chatId] + '"')
        
        if (order_status[chatId] === order_statuses_text[3]){
            let temp_text = 'Нам жаль, но мы были вынуждены отклонить Ваш заказ. Вы можете связаться с нами, нажав на кнопку <b>' + sendphone_point[0] + '</b>'

            if (message_toedit[chatId][5] !== undefined){
                bot.deleteMessage(chatId, message_toedit[chatId][5])
                bot.sendMessage(chatId, temp_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: sendphone_point[0],
                                callback_data: sendphone_point[1]
                            }],
                            [{
                                text: finish_order_text[0],
                                callback_data: reallystartagain[1]
                            }]
                        ]
                    }
                }) 
                .then(res => {
                    message_toedit[chatId][5] = res.message_id
                    message_text[chatId][5] = res.text
                })
            }
            else {
                bot.sendMessage(chatId, temp_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: sendphone_point[0],
                                callback_data: sendphone_point[1]
                            }],
                            [{
                                text: finish_order_text[0],
                                callback_data: reallystartagain[1]
                            }]
                        ]
                    }
                }) 
                .then(res => {
                    message_toedit[chatId][5] = res.message_id
                    message_text[chatId][5] = res.text
                })
            }
        }
        
        if (order_status[chatId] === order_statuses_text[2]){
            //мы получили заказ. На клаве вместо статус заказа поставить "заказ получен". Также написать сообщение мол ваш заказ был успешно доставлен. Нажмите на кнопку "готово", чтобы получить баллы или заказать еще раз. 
            //После нажатия на кнопку готово, мы очищаем все данные связывающие аккаунт с чеком доставки, чтобы если в чате доставщиков поменяют статус, клиент не получал опевещений. 
            
            let temp_text = `<b>✅ Ваш заказ был успешно доставлен!</b>
` + finalbasket[chatId] + `

Для завершение заказа  нажмите кнопку <b>"` + finish_order_text[0] + `". </b>
Если вы столкнулись с проблемой при заказе, нажмите на кнопку <b>"` + sendphone_point[0] + `".</b> Мы будем рады помочь.`
            if (message_toedit[chatId][5] !== undefined){
                bot.deleteMessage(chatId, message_toedit[chatId][5])
                bot.sendMessage(chatId, temp_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: sendphone_point[0],
                                callback_data: sendphone_point[1]
                            }],
                            [{
                                text: finish_order_text[0],
                                callback_data: finish_order_text[1]
                            }]
                        ]
                    }
                }) .then(res => {
                    message_toedit[chatId][5] = res.message_id
                    message_text[chatId][5] = res.text
                })
            }
            else {
                bot.sendMessage(chatId, temp_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: sendphone_point[0],
                                callback_data: sendphone_point[1]
                            }],
                            [{
                                text: finish_order_text[0],
                                callback_data: finish_order_text[1]
                            }]
                        ]
                    }
                }) .then(res => {
                    message_toedit[chatId][5] = res.message_id
                    message_text[chatId][5] = res.text
                })
            }
        
        }

        if (order_status[chatId] === order_statuses_text[1]){
            //в этом случае выводить клавиатуру как после успешного заказа. Вдруг кто-то по ошибке нажмет что заказ доставлен. Тогда клиент звонит в кафе и после разговора статус снова меняют на "доставляется" и продолжают работать. 
            
            bot.sendSticker(chatId, sticker_indeliver).then(() => {
                let txt = '<b>Статус заказа изменен на "' +  order_status[chatId] + `"</b>
` + finalbasket[chatId]
console.log('msg5 id: ' + message_toedit[chatId][5])
                if (message_toedit[chatId][5] !== undefined){
                    bot.deleteMessage(chatId, message_toedit[chatId][5])
                    console.log('msg54 id: ' + message_toedit[chatId][5])
                    bot.sendMessage(chatId, txt, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: sendphone_point[0],
                                    callback_data: sendphone_point[1]
                                }]
                            ]
                        }
                    }) 
                    .then(res => {
                        message_toedit[chatId][5] = res.message_id
                        message_text[chatId][5] = res.text
                    })
                }
                else {
                    console.log('msg56 id: ' + message_toedit[chatId][5])
                    bot.sendMessage(chatId, txt, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: sendphone_point[0],
                                    callback_data: sendphone_point[1]
                                }]
                            ]
                        }
                    }).then(res => {
                        message_toedit[chatId][5] = res.message_id
                        message_text[chatId][5] = res.text
                    })
                }
                
            }) 
        
        }
    }
)
}
function CheckUser(userid, username, chatId, message_id){
    
    console.log('checking user: ' + userid + ' ' + username)
    let userdata = fb.database().ref('Delivery/'+ UserDelCat[chatId] + '/' + userPoint[chatId] +'/clients/' + userid)
    userdata.get().then((result) => 
    {
        console.log('Пользователь зарегистрирован. ID: ' + userid + ' ' + result.val().id)
        user_adress[chatId] = result.val().adress
        user_email[chatId] = result.val().email
        user_name[chatId] = result.val().name
        user_username[chatId] = result.val().username
        user_phone[chatId] = result.val().phone
        user_id[chatId] = result.val().id
        alltime_purchases_amount[chatId] = result.val().alltime_purchases_amount
        user_coins[chatId] = result.val().coins

        userstatus[chatId] = 'registered'

        bot.sendMessage(chatId, almostthere_text, {
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
        }).then(res => {
            message_toedit[chatId][1] = res.message_id
            message_text[chatId][1] = res.text
            //console.log('savedmessage = ' + add_info_msg[current_chat] + ', ' + message_id)
        })

        StartAnalitycs()

    }).catch(error => {
        console.log('Пользователь не зарегистрирован. ' + error)
        console.log('Данные о незареганном пользователе: ' + user_phone[chatId] + ', ' + user_adress[chatId])
        userstatus[chatId] = 'unregistered'
        user_name[chatId] = username
        bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Имя: ' + user_name[chatId],
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
        }).then(res => {
            //add_info_msg[current_chat] = message_id + 2 
            message_toedit[chatId][1] = res.message_id
            message_text[chatId][1] = res.text
            //console.log('savedmessage = ' + add_info_msg[current_chat] + ', ' + message_id)
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

function AddMailingData(chatId){

    if (finalprice[chatId] >= reach_min){
        console.log('!? reach_min: ' + reach_min)
        let userdata = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/reach')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                if (user_ids[i] === chatId.toString()){
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== chatId.toString()){
                    let updates = {}
                    updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/reach/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + chatId
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += chatId
                    }

                    updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/reach/user_ids'] = user_ids_string

                    fb.database().ref().update(updates)
                }
            }
           
        })
    }

    if (finalprice[chatId] <= cheap_max){
        let userdata = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/cheap')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                if (user_ids[i] === chatId.toString()){
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== chatId.toString()){
                    let updates = {}
                    updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/cheap/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + chatId
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += chatId
                    }
                    
                    updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/cheap/user_ids'] = user_ids_string
                    
                    fb.database().ref().update(updates)
                }
            }
           
        })
    }

    for (let i = 0; i < food_categories[chatId].length; i++){
        if (favourite_food[chatId]=== food_categories[chatId][i][2]){
            console.log('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/' + food_categories[chatId][i][2])
            let userdata = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/' + food_categories[chatId][i][2])
            userdata.get().then((result) => 
            {
                let count = result.val().user_amount
                count++
                let user_ids_string = ''
                user_ids_string = result.val().user_ids
                let user_ids = user_ids_string.split(',')
                
                for (let i = 0; i < user_ids.length; i++){
                    console.log('category user ids list: ' + user_ids[i] + ' ' + chatId)
                    if (user_ids[i] === chatId.toString()){
                        console.log('found user_id. BREAK! ' + user_ids[i] + ' ' + chatId)
                        break
                    }
                    if (i === user_ids.length - 1 && user_ids[i] !== chatId.toString()){
                        console.log('users length = ' + user_ids.length + ', i =' + i)
                        let updates = {}
                        updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/' + favourite_food[chatId]+ '/user_amount'] = count

                        if (user_ids_string !== ''){
                            user_ids_string += ',' + chatId
                        }
    
                        else if (user_ids_string === ''){
                            user_ids_string += chatId
                        }

                        updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/categories/' + favourite_food[chatId]+ '/user_ids'] = user_ids_string
                        
                        fb.database().ref().update(updates)
                    }
                }
            })

            
            
        }
    }

        let userdata = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/all')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                console.log('all, user ids list: ' + user_ids[i] + ' ' + chatId)
                if (user_ids[i] === chatId.toString()){
                    console.log('found user_id. BREAK! "' + user_ids[i] + '" "' + chatId + '"')
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== chatId.toString()){
                    console.log('users length = "' + user_ids.length + '", i = "' + i + '". (user_ids[i] !== chatId): ' + user_ids[i] + ' !== ' + chatId)
                    let updates = {}
                    updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/all/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + chatId
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += chatId
                    }

                    updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/all/user_ids'] = user_ids_string

                    fb.database().ref().update(updates)
                }
            }
           
        })
}

function StartMailing(text, chatId) {
    let mail = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/mailing/all/user_ids')
        mail.get().then(result => {
            let arr = result.val()
            arr = arr.split(',')
            for(let i = 0; i<arr.length; i++){
                bot.sendMessage(arr[i], text, {
                    parse_mode:'HTML'
                })
                .catch(err => {console.log('! ' + err)})
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
        let userdata = fb.database().ref('Delivery/' + UserDelCat[poll_answer.user.id] + '/' + userPoint[poll_answer.user.id] + '/other_info/stats')
        userdata.get().then((result) => {

            let rate = (result.val().rating + parseInt(answered_feedback[poll_answer.user.id]))
            console.log('rate: ' + rate + ', fb: ' + answered_feedback[poll_answer.user.id])
            rate = rate / 2
            console.log('rate: ' + rate)
            let updates = {}

            updates['Delivery/' + UserDelCat[poll_answer.user.id] + '/' + userPoint[poll_answer.user.id] + '/other_info/stats/feedbacks_amount'] = result.val().feedbacks_amount + 1

            updates['Delivery/' + UserDelCat[poll_answer.user.id] + '/' + userPoint[poll_answer.user.id] + '/other_info/stats/rating'] = rate
            fb.database().ref().update(updates)
            
        })
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

bot.on('message', (msg) =>
{
    const { chat, message_id, text } = msg
    console.log(msg)
    const chatId = chat.id

    current_chat = chatId

    if (text === '🔃 Заказать снова'){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello).then(() => {
            Reset(chatId)
            anotherpoint_multiple[chatId] = 2
            //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
        })
    }

    if (text === coins_text){
        /* bot.editMessageText(text, {
            chat_id: chatId,
            message_id: message_id - 1
        }).then(() => {
            bot.deleteMessage(chatId, message_id).then(() => {
                bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
            })
        }) */

        bot.deleteMessage(chatId, message_id).then(() => {
            bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
        })
    }

    /* if (text === anotherpoint_text){
        finalprice[chatId] = 0
        finalbasket[chatId] = 0
        console.log('2414124')
        if (userFood[chatId] !== null || userFoodlist[chatId] !== []){
            bot.deleteMessage(chatId, message_id)
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
    } */
    if (text === myorder_text){

        //bot.deleteMessage(chatId, message_id-1)
        bot.deleteMessage(chatId, message_id).catch(err => {console.log('! ' + err)})
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket[chatId].length; i++){
                            finalsum += (basket[chatId][i][2] * basket[chatId][i][1])
                            if (i === basket[chatId].length - 1){
                                editmsg += finalsum + 'тг. +' + delivery_price[chat.id] + 'тг. (доставка)'
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
        
    }
    if (text === paybasket_text){
        console.log('!!!' + (finalprice[chatId] - 1000))
        if (finalprice[chatId] - 1000 < delivery_min_price){
            bot.sendMessage(chatId, 'Минимальная сумма заказа: ' + delivery_min_price + '. Закажите что-нибудь еще 😇')
        }
        else {
            bot.deleteMessage(chatId, message_id - 1).catch(err => {console.log('! ' + err)})
            bot.deleteMessage(chatId, message_id).catch(err => {console.log('! ' + err)})
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chatId].length; i++){
                                finalsum += (basket[chatId][i][2] * basket[chatId][i][1])
                                if (i === basket[chatId].length - 1){
                                    editmsg += finalsum + 'тг. +' + delivery_price[chat.id] + 'тг. (доставка)'
                                    console.log(finalsum + ' ' + i)
                                    finalprice[chatId] = finalsum + delivery_price[chat.id]
                                    for (let i = 0; i < basket[chatId].length; i++){
                                        console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                        editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                        if (i === basket[chatId].length - 1){
                                            finalbasket[chatId] = editmsg
                                            bot.sendMessage(chatId,  editmsg).then(() => {
                                                CheckUser(chatId, chat.first_name, chatId, message_id)
                                            })
                
                                        }
                                    }
                                }
                }

        }
        
    }
    if (text === location_text){
        bot.sendLocation(chatId, point_location[0], point_location[1]).then(() => {
            bot.sendMessage(chatId, '📍 Мы находимся по адресу: ' + point_adress[chatId])
        })
        
    }
    if (text === phone_text){
        bot.sendContact(chatId, help_phone, restaurant_name)
    }
    if (isMailingMessage[chatId] !== 0 && isMailingMessage[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        //утро
        if (isMailingMessage[chatId] === 1){
            isMailingMessage[chatId] = 0
            mailing_text[chatId] = `📧 Сообщение от <b>` + userPoint[chatId] + `:</b>
` + msg.text
            let info = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chat.id] + '/mailing/all/user_ids')
            info.get().then((result) => {
                if (result.exists()){
                    let num = result.val().split(',')

                    bot.editMessageText('Вы уверены, что хотите отправить это сообщение всем <b>клиентам утренних групп</b>? Это сообщение получат <b>' + num.length + ' человек </b>.', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: message_toedit[chatId][7],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить',
                                    callback_data: keyboards.admin_preferences_buttons[3][1]
                                }],
                                [{
                                    text: 'Да, отправить',
                                    callback_data: sendmessage_cb
                                }]
                            ]
                        }
                    })
                }

                else {
                    bot.editMessageText('К сожалению у Вас нет клиентов для рассылки', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: message_toedit[chatId][7],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: keyboards.admin_preferences_buttons[3][1]
                                }]
                            ]
                        }
                    })
                }
            })
        }
    }
    if (isChangingTime[chatId] !== 0 && isChangingTime[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'Установите время работы доставки (напр. 8:00-22:00). Время должно быть в формате 24 ч.'
        if (isChangingTime[chatId] === 1){
            isChangingTime[chatId] = 0
            if (msg.text.includes('-') && msg.text.includes(':')){
                point_workingtime[chatId] = (msg.text).split('-')
                point_workingtime[chatId][0] = point_workingtime[chatId][0].split(':')
                point_workingtime[chatId][1] = point_workingtime[chatId][1].split(':')

                let updates = {}
                updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/delivery_info/working_time'] = msg.text
                fb.database().ref().update(updates)
            }
            else {
                fnl_txt = '<b>Вы ввели неверное значение.</b> Рекомендуем не менять эти настройки или связаться с службой поддрежки'
            }
            
        }
        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: message_toedit[chatId][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_times[1][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_times[0][0] + ' c ' + point_workingtime[chat.id][0][0] + ':' + point_workingtime[chat.id][0][1] + ' по ' + point_workingtime[chat.id][1][0] + ':' + point_workingtime[chat.id][1][1],
                        callback_data: keyboard_admin_times[0][1]
                    }]
                ]
            }
        })
    }
    if (isChangingDelivery[chatId] !== 0 && isChangingDelivery[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'Введите информацию о доставке. Это облегчит процесс заказа для ваших клиентов.'
        if (isChangingDelivery[chatId] === 1){
            isChangingDelivery[chatId] = 0
            delivery_min_price[chatId] = parseInt(msg.text)
            let updates = {}
            updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/delivery_info/delivery_min_price'] = delivery_min_price[chatId]
            fb.database().ref().update(updates)
        }
        if (isChangingDelivery[chatId] === 2){
            isChangingDelivery[chatId] = 0
            delivery_price[chatId] = parseInt(msg.text)
            let updates = {}
            updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/delivery_info/delivery_price'] = delivery_price[chatId]
            fb.database().ref().update(updates)
        }
        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: message_toedit[chatId][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: 'backtoalldata_cb'
                    },
                    {
                        text: keyboard_admin_delset[0][0] + delivery_min_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[0][1]
                    }],
                    [{
                        text: keyboard_admin_delset[1][0] + delivery_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[1][1]
                    },
                    {
                        text: keyboard_admin_delset[2][0],
                        callback_data: keyboard_admin_delset[2][1]
                    }]
                ]
            }
        })
    }
    if (isChangingPhone[chatId] !== 0 && isChangingPhone[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'Укажите данные для связи с вами. Клиент увидит их когда выберет ваше заведение'
        if (isChangingPhone[chatId] === 1){
            isChangingPhone[chatId] = 0
            help_phone[chatId] = msg.text
            let updates = {}
            updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/place_info/contact_phone'] = help_phone[chatId]
            fb.database().ref().update(updates)
        }
        if (isChangingPhone[chatId] === 2){
            if (msg.location !== undefined){
                isChangingPhone[chatId] = 0
    
                point_location[chatId][0] = msg.location.latitude
                point_location[chatId][1] = msg.location.longitude
    
                let updates = {}
                updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/place_info/latitude'] = point_location[chatId][0]
                updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/place_info/longitude'] = point_location[chatId][1]
                fb.database().ref().update(updates)
            }
            else {
                fnl_txt = 'Вы не отправили геопозицию. Изменения не были внесены.'
            }
    
        }
        if (isChangingPhone[chatId] === 3){
            isChangingPhone[chatId] = 0
            point_adress[chatId] = msg.text
            let updates = {}
            updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/place_info/adress_text'] = point_adress[chatId]
            fb.database().ref().update(updates)
        }
        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: message_toedit[chatId][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[3][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_phone[0][0] + help_phone[chat.id],
                        callback_data: keyboard_admin_phone[0][1]
                    },
                    {
                        text: keyboard_admin_phone[1][0] + point_location[chat.id][0] + ', ' + point_location[chat.id][1],
                        callback_data: keyboard_admin_phone[1][1]
                    }],
                    [{
                        text: keyboard_admin_phone[2][0] + point_adress[chat.id],
                        callback_data: keyboard_admin_phone[2][1]
                    }]
                ]
            }
        })
    } 
    if (isWritingCoupon[chatId] !== 0 && isWritingCoupon[chatId] !== undefined){
        isWritingCoupon[chatId] = 0
        bot.deleteMessage(chatId, message_id)
        let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons')
        point_info.get().then((snapshot) => {
            isWritingCoupon[chatId] = 0
            if (snapshot.exists()){
                let coupons = Object.keys(snapshot.val())
                for (let i = 0; i < coupons.length; i++){
                    let gett = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i])
                    gett.get().then((res) => {
                        if (msg.text === res.val().name){
                            if (res.val().activ_left > 0){
                                clients = res.val().clients 
                                if (!clients.includes(chatId.toString())) {
                                    coupondata[chatId] = []
                                    coupondata[chatId][0] = res.val().name
                                    coupondata[chatId][1] = res.val().percent
    
                                   /*  let updates = {}
                                    updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i] + '/activ_left'] = res.val().activ_left - 1
                                    updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i] + '/activated'] = res.val().activated + 1
                                    

                                    fb.database().ref().update(updates) */
    
                                    bot.deleteMessage(chatId, message_toedit[chatId][2])
                                    bot.sendMessage(chatId, `Промокод успешно активирован 🥳 
Вы получаете скидку ` + res.val().percent + `%. Бегом тратить!` , {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            inline_keyboard: [
                                                [{
                                                    text: 'Продолжить',
                                                    callback_data: mybasket_text
                                                }]
                                            ]
                                        }
                                    })
                                    .then(res => {
                                        message_toedit[chatId][2] = res.message_id
                                    })
                                }
                                else if (clients.includes(chatId.toString())){
                                    bot.deleteMessage(chatId, message_toedit[chatId][2])
                                    bot.sendMessage(chatId, 'Вы уже использовали этот промокод', {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            inline_keyboard: [
                                                [{
                                                    text: '◀️ Назад',
                                                    callback_data: mybasket_text
                                                }]
                                            ]
                                        }
                                    })
                                    .then(res => {
                                        message_toedit[chatId][2] = res.message_id
                                    })
                                }
                            }
                            else {
                                bot.deleteMessage(chatId, message_toedit[chatId][2])
                                bot.sendMessage(chatId, 'О нет, Вы не успели. Промокод уже ввели 😢', {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{
                                                text: '◀️ Назад',
                                                callback_data: mybasket_text
                                            }]
                                        ]
                                    }
                                })
                                .then(res => {
                                    message_toedit[chatId][2] = res.message_id
                                })
                            }
                        }
                        if (i === coupons.length - 1 && msg.text !== res.val().name){
                            bot.deleteMessage(chatId, message_toedit[chatId][2])
                            bot.sendMessage(chatId, 'Промокод не подходит 😕', {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: '◀️ Назад',
                                            callback_data: mybasket_text
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                message_toedit[chatId][2] = res.message_id
                            })
                        }
                    })
                }
            }
            else {
                isWritingCoupon[chatId] = 0
                bot.deleteMessage(chatId, message_toedit[chatId][2])
                bot.sendMessage(chatId, 'Промокод не подходит 😕', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: '◀️ Назад',
                                callback_data: mybasket_text
                            }]
                        ]
                    }
                })
                .then(res => {
                    message_toedit[chatId][2] = res.message_id
                })
            }
        })
    }
    if (isCreatingCoupon[chatId] !== 0 && isCreatingCoupon[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        console.log('startEDDD')
        let fnl_txt = 'Введите код купона. Он может быть любым, но клиенту нужно будет точь-в-точь его скопировать:'
        switch (isCreatingCoupon[chat.id]){
            case 1: 
            console.log('case 1')
            coupondata[chat.id][0] = msg.text
            fnl_txt = 'Введите максимальное число активаций купона (не более ' + coupondata[chat.id][1] + ')'
            bot.editMessageText(fnl_txt, {
                parse_mode: 'HTML',
                chat_id: chatId,
                message_id: message_toedit[chatId][7],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Не создавать',
                            callback_data: 'backtoalldata_cb'
                        }]
                    ]
                }
            })
            isCreatingCoupon[chat.id] = 2
            break

            case 2: 
            console.log('case 2')
            if (parseInt(msg.text) <= coupondata[chat.id][1]) {
                coupondata[chat.id][1] = parseInt(msg.text)
            }

            fnl_txt = 'Сколько процентов скидки получат клиенты, когда введут этот промокод? Введите число:'
            bot.editMessageText(fnl_txt, {
                parse_mode: 'HTML',
                chat_id: chatId,
                message_id: message_toedit[chatId][7],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Не создавать',
                            callback_data: 'backtoalldata_cb'
                        }]
                    ]
                }
            })
            isCreatingCoupon[chat.id] = 3
            break

            case 3: 
            console.log('case 3')
            if (parseInt(msg.text) > 100) {
                coupondata[chat.id][2] = 100
            }
            if (parseInt(msg.text) <= 100) {
                coupondata[chat.id][2] = parseInt(msg.text)
            }
            let updates = {}
            updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/name'] = coupondata[chat.id][0]
            updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = coupondata[chat.id][1]
            updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/percent'] = coupondata[chat.id][2]
            updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = 0
            updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = chatId + ','

            fb.database().ref().update(updates)
            fnl_txt = 'Купон <b>'+ coupondata[chat.id][0] +'</b> создан! Вы можете поделиться им в своих соц. сетях, либо использовать рассылку. Это простимулирует дополнительные продажи 😎'
            bot.editMessageText(fnl_txt, {
                parse_mode: 'HTML',
                chat_id: chatId,
                message_id: message_toedit[chatId][7],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'На главную',
                            callback_data: keyboards.admin_preferences_buttons[3][1]
                        }]
                    ]
                }
            })
            isCreatingCoupon[chat.id] = 0
            break
        }
        
    }
    if (isMakingChanges[chatId] !== 0  && user_mode[chatId] !== undefined && isMakingChanges[chatId] !== undefined){
        console.log('opps ' + isMakingChanges[chatId])
        let answ_text = almostthere_text
        if (isMakingChanges[chatId] === 1){
            isMakingChanges[chatId] = 0
            user_name[chatId] = text
        }

        if (isMakingChanges[chatId] === 2){
            isMakingChanges[chatId] = 0
            if (msg.contact !== undefined){
                user_phone[chatId] = msg.contact.phone_number
            }
            else if (msg.contact === undefined){
                if (text !== '◀️ Назад'){
                    answ_text = `Вы не отправили номер телефона! Чтобы это сделать, нажмите на кнопку снизу`
                    bot.deleteMessage(chat.id, message_toedit[chat.id][1])
                    bot.sendMessage(chat.id,answ_text, {
                        parse_mode: 'HTML',
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
                    }).then(res => {
                        message_toedit[chat.id][1] = res.message_id
                        message_text[chat.id][1] = res.text
                    })
                }
/*                 else {
                    
                } */
            }
        }

        if (isMakingChanges[chatId] === 3){
            isMakingChanges[chatId] = 0
            user_adress[chatId] = text
        }

        if (isMakingChanges[chatId] === 4){
            isMakingChanges[chatId] = 0
            user_email[chatId] = text
            user_coins[chatId] = user_coins[chatId] + (added_coins[chatId] * percent_foremail)
            user_coins[chatId] = Math.round(user_coins[chatId])
            //тут возвращаем пользователя на главную, но уже регистеред

            let updates = {};
            updates['Basement/clients/' + chatId + '/email'] = user_email[chatId]
            updates['Basement/clients/' + chatId + '/coins'] = user_coins[chatId]
            fb.database().ref().update(updates).then(() => {
                //тут отправить в главное меню
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        console.log(err)
                    })
                }
                bot.sendMessage(chatId, 'Ура! Email подтвержден. Вам было зачислено ' + (added_coins[chatId] * percent_foremail) + ' тенге. Ваш баланс: ' + user_coins[chatId] + ' тенге').then(() => {
                    Reset(chatId)
                    anotherpoint_multiple[chatId] = 2
                    keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId], message_toedit[chat.id], message_text[chat.id])
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
                /* let bill_update = {
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
                    feedback_message: text,
                    bill_text: snapshot.val().bill_text,
                    user_personsamount: snapshot.val().user_personsamount,
                    user_payingmethod: snapshot.val().user_payingmethod,
                    user_deliverdate: snapshot.val().user_deliverdate,
                    user_sdachainfo: snapshot.val().user_sdachainfo,
                    user_howtocome: snapshot.val().user_howtocome
                } */
                updates[order_name[chat.id] + '/feedback'] = feedback_options[answered_feedback[chat.id]]
                updates[order_name[chat.id] + 'feedback_message'] = text
                bot.deleteMessage(chat.id, message_id).catch(err => {console.log('hr: ' + err)})
                fb.database().ref().update(updates).then(() => {
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, message_id - i).catch(() => {
                        })
                    }
                    bot.sendSticker(chatId, goodfeedback_text).then(() => {
                        bot.sendMessage(chatId, 'Мы рады, что Вы пользуетесь Resify. Закажем что-нибудь еще?').then(() => {
                            //Reset(chatId)
                            anotherpoint_multiple[chatId] = 2
                            userPoint[chat.id] = 0
                            userCategory[chat.id] = ''
                            userFood[chat.id] = ''
                            userFoodlist[chat.id] = []
                            order_name[chatId] = 0
                            coupondata[chat.id] = undefined
                            
                            basket[chat.id] = []
                            finalprice[chatId] = 0
                            finalbasket[chatId] = ''
                            temp_backet_food[chatId] = 0
                            temp_food_text[chatId] = ''
                            temp_food_price[chatId] = 0
                            temp_foodamount[chatId] = 1
                            skidka[chatId] = 0
                            keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], UserDelCat[chat.id], fb, bot, chat.id, change_delcat_text, choosepoint_text, user_mode[chat.id], sendlocation, message_toedit[chat.id], message_text[chat.id])
                            //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chatId], userPoint[chatId], user_mode[chatId], message_toedit[chat.id], message_text[chat.id])
                        })
    
                    })
                    
                    let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
├ Оценка клиента: ` + feedback_options[answered_feedback[chatId]] + `
└ Сообщение: ` + text
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: delivery_chat[chatId],
                        message_id: snapshot.val().message_id
                    })
                }).catch(error => {
                    console.log(error)
                })
            }) 
        }

        if (user_adress[chatId] !== '' && user_phone[chatId] !== '' && user_name[chatId] !== '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5){
            //order_status = order_statuses_text[0]
            console.log('LOL ' + message_id + ', ' + (message_id - 1))
            bot.deleteMessage(chatId, message_id).then(() => {
                console.log('LOL2 ' + message_id + ', ' + (message_id - 1))
            })
            if (msg.contact === undefined){
                bot.editMessageText(answ_text, {
                    chat_id: chatId,
                    message_id: message_toedit[chat.id][1],
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
                if (msg.text === '◀️ Назад'){
                    bot.deleteMessage(chatId,  message_toedit[chat.id][1])
                    bot.sendMessage(chatId, answ_text, {
                        parse_mode: 'HTML',
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
                    }).then(res => {
                        message_toedit[chat.id][1] = res.message_id
                        message_text[chat.id][1] = res.text
                    }).catch(err => {
                        console.log('1235 ' + err)
                    })
                }
            }
            if (msg.contact !== undefined) {
                bot.deleteMessage(chatId,  message_toedit[chat.id][1])
                bot.sendMessage(chatId, answ_text, {
                    parse_mode: 'HTML',
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
                }).then(res => {
                    message_toedit[chat.id][1] = res.message_id
                    message_text[chat.id][1] = res.text
                }).catch(err => {
                    console.log('1235 ' + err)
                })
            }
            
            
        }
        if (user_adress[chatId] === '' || user_phone[chatId] === '' || user_name[chatId] === '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5)
        {
            console.log('LOL3 ' + message_id + ', ' + (message_id - 1) + ', save_msgid: ' + add_info_msg[chatId])
            bot.deleteMessage(chatId, message_id)
            
            if (text !== '◀️ Назад' && msg.contact === undefined){
                bot.editMessageText(answ_text, {
                    chat_id: chatId,
                    message_id: message_toedit[chat.id][1],
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
                    console.log('214 ' + err)
                })
            }
            
            if (msg.contact !== undefined) {
                bot.deleteMessage(chatId,  message_toedit[chat.id][1])
                bot.sendMessage(chatId, answ_text, {
                    parse_mode: 'HTML',
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
                }).then(res => {
                    message_toedit[chat.id][1] = res.message_id
                    message_text[chat.id][1] = res.text
                }).catch(err => {
                    console.log('1235 ' + err)
                })
            }
            
            if (msg.text === '◀️ Назад'){
                bot.deleteMessage(chatId,  message_toedit[chat.id][1])
                bot.sendMessage(chatId, answ_text, {
                    parse_mode: 'HTML',
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
                }).then(res => {
                    message_toedit[chat.id][1] = res.message_id
                    message_text[chat.id][1] = res.text
                }).catch(err => {
                    console.log('1235 ' + err)
                })
            }
        }
    }

    if (isMakingChanges_3[chatId] === 1  && user_mode[chatId] !== undefined && isMakingChanges_3[chatId] !== undefined){
        isMakingChanges_3[chatId] = 0
        isMakingChanges_2[chatId] = 0
        console.log('isMakingChanges 3!')
        
        user_howtocome[chatId] = text
        if (userstatus[chat.id] !== 'unregistered'){
            skidka[chat.id] = 0
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        inline_keyboard: unregistered_keyboard[3],
                    }
                }).then(res => {
                    message_toedit[chat.id][5] = res.message_id
                    message_text[chat.id][5] = res.text
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
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/adress'] = user_adress[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_price'] = average_price[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/email'] = user_email[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/favourite_food'] = favourite_food[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/id'] = chat.id
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/name'] = user_name[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/phone'] = user_phone[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/username'] = username[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]

                updates['Motherbase/clients/' + chat.id + '/adress'] = user_adress[chat.id]

                updates['Motherbase/clients/' + chat.id + '/food/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/favourite_food'] = favourite_food[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/average_price'] = average_price[chat.id]

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))

                order_name[chat.id] = 'Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/bills/' + time_now.getTime()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = (time_now.getTime()).toString()

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
            
                updates[order_name[chat.id] + '/date_ordered'] = time_now.getTime()
                updates[order_name[chat.id] + '/order_info'] = finalbasket[chat.id]
                updates[order_name[chat.id] + '/price'] = finalprice[chat.id],
                updates[order_name[chat.id] + '/client_id'] = chat.id
                updates[order_name[chat.id] + '/phone'] = user_phone[chat.id]
                updates[order_name[chat.id] + '/order_status'] = order_statuses_text[0]
                updates[order_name[chat.id] + '/adress'] = user_adress[chat.id]
                updates[order_name[chat.id] + '/client_name'] = user_name[chat.id]
                updates[order_name[chat.id] + '/user_payingmethod'] =user_payingmethod[chat.id]
                updates[order_name[chat.id] + '/user_deliverdate'] = user_deliverdate[chat.id]
                updates[order_name[chat.id] + '/user_sdachainfo'] = user_sdachainfo[chat.id]
                updates[order_name[chat.id] + '/user_howtocome'] = user_howtocome[chat.id]

                if (coupondata[chat.id] !== undefined) {
                    let point_info4 = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients')
                    point_info4.get().then((csnap) => {
                        if (csnap.exists()){
                            let upd = {}
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = csnap.val().activ_left - 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = csnap.val().activated + 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = csnap.val().clients + ',' + chat.id    
                            fb.database().ref().update(upd)
                        }
                        
                    })
                }
                if (point_pplamount[chat.id] !== false){
                    updates[order_name[chat.id] + '/user_personsamount'] = user_personsamount[chat.id]
                }

                if (userstatus[chat.id] === 'unregistered'){
                    userstatus[chat.id] = 'registered'
                }
                
                fb.database().ref().update(updates)

                AddMailingData(chat.id)
                StartCheckingOrder(chat.id)

                if (coupondata[chat.id] !== undefined) {
                    let point_info4 = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients')
                    point_info4.get().then((csnap) => {
                        if (csnap.exists()){
                            let upd = {}
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = csnap.val().activ_left - 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = csnap.val().activated + 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = csnap.val().clients + ',' + chat.id    
                            fb.database().ref().update(upd)
                        }
                        
                    })
                }

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = time_now.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = time_now.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + time_now.getDate() + '.' + (time_now.getMonth() + 1)

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
    if (coupondata[chat.id] !== undefined){
        deliver_bill_finalprice += `Использован купон ` + coupondata[chat.id][0] + `. Скидка ` + coupondata[chat.id][1] + `% учтена в итоговой стоимости

`
    }

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>`
    if (point_pplamount[chat.id] !== false){
        deliver_bill_help_info += `
├ Кол-во персон: ` + user_personsamount[chat.id]
    }
    deliver_bill_help_info += `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + message_id)
    console.log('delivery_chat: ' + delivery_chat[chat.id])
    bot.sendMessage(delivery_chat[chat.id], delivers_bill, {
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
    })

            })
        }
        else {
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        inline_keyboard: unregistered_keyboard[3],
                    }
                }).then(res => {
                    message_toedit[chat.id][5] = res.message_id
                    message_text[chat.id][5] = res.text
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
                
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/adress'] = user_adress[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_price'] = average_price[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/email'] = user_email[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/favourite_food'] = favourite_food[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/id'] = chat.id
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/name'] = user_name[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/phone'] = user_phone[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/username'] = username[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
               
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_purchases'] = average_purchases[chat.id]
                
                updates['Motherbase/clients/' + chat.id + '/adress'] = user_adress[chat.id]

                updates['Motherbase/clients/' + chat.id + '/food/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/favourite_food'] = favourite_food[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/average_price'] = average_price[chat.id]

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chat.id] = 'Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/bills/' + time_now.getTime()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = (time_now.getTime()).toString()

                updates[order_name[chat.id] + '/date_ordered'] = time_now.getTime()
                updates[order_name[chat.id] + '/order_info'] = finalbasket[chat.id]
                updates[order_name[chat.id] + '/price'] = finalprice[chat.id],
                updates[order_name[chat.id] + '/client_id'] = chat.id
                updates[order_name[chat.id] + '/phone'] = user_phone[chat.id]
                updates[order_name[chat.id] + '/order_status'] = order_statuses_text[0]
                updates[order_name[chat.id] + '/adress'] = user_adress[chat.id]
                updates[order_name[chat.id] + '/client_name'] = user_name[chat.id]
                updates[order_name[chat.id] + '/user_payingmethod'] =user_payingmethod[chat.id]
                updates[order_name[chat.id] + '/user_deliverdate'] = user_deliverdate[chat.id]
                updates[order_name[chat.id] + '/user_sdachainfo'] = user_sdachainfo[chat.id]
                updates[order_name[chat.id] + '/user_howtocome'] = user_howtocome[chat.id]
            
                if (point_pplamount[chat.id] !== false){
                    updates[order_name[chat.id] + '/user_personsamount'] = user_personsamount[chat.id]
                }

                if (userstatus[chat.id] === 'unregistered'){
                    userstatus[chat.id] = 'registered'
                }

                fb.database().ref().update(updates)

                AddMailingData(chat.id)
                StartCheckingOrder(chat.id)

                if (coupondata[chat.id] !== undefined) {
                    let point_info4 = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients')
                    point_info4.get().then((csnap) => {
                        if (csnap.exists()){
                            let upd = {}
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = csnap.val().activ_left - 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = csnap.val().activated + 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = csnap.val().clients + ',' + chat.id    
                            fb.database().ref().update(upd)
                        }
                        
                    })
                }

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = time_now.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = time_now.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + time_now.getDate() + '.' + (time_now.getMonth() + 1)
    
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
if (coupondata[chat.id] !== undefined){
    deliver_bill_finalprice += `Использован купон ` + coupondata[chat.id][0] + `. Скидка ` + coupondata[chat.id][1] + `% учтена в итоговой стоимости

`
}

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + visible_date + `

`

deliver_bill_help_info = `<b>📌 Доп. информация</b>`
    if (point_pplamount[chat.id] !== false){
        deliver_bill_help_info += `
├ Кол-во персон: ` + user_personsamount[chat.id]
    }
    deliver_bill_help_info += `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])

    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + message_id)
    bot.sendMessage(delivery_chat[chat.id], delivers_bill, {
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
    })
    
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
    }

    if (isMakingChanges_2[chatId] !== 0 && user_mode[chatId] !== undefined && isMakingChanges_2[chatId] !== undefined){
        console.log('!#!@%$ ' + user_mode[chatId])
        if (isMakingChanges_2[chatId] === 1){
            isMakingChanges_2[chatId] = 0
            user_personsamount[chatId] = text
        }

        if (isMakingChanges_2[chatId] === 2){
            isMakingChanges_2[chatId] = 0
            user_deliverdate[chatId] = text
        }

        if (isMakingChanges_2[chatId] === 3){
            console.log('isMakingChanges_2!')
            isMakingChanges_3[chatId] = 1
            user_sdachainfo[chatId] = text
            bot.deleteMessage(chatId, message_id).catch(err => {
                console.log(err)
            })
            bot.editMessageText('Уточните, как курьер может до вас добраться: ', {
                chat_id: chatId, 
                message_id: message_toedit[chat.id][1],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: no_howtocome_text,
                            callback_data: no_howtocome_text
                        }]
                    ]
                }
            }).catch(err => {
                console.log(add_info_msg[chatId] + ' | ' + message_id + ' | ' + err)
            })
        }

        if (isMakingChanges_2[chatId] === 4){
            isMakingChanges_2[chatId] = 0
            user_howtocome[chatId] = text
            console.log('!HERE!')
if (userstatus[chat.id] !== 'unregistered'){
            skidka[chat.id] = 0
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        inline_keyboard: unregistered_keyboard[3],
                    }
                }).then(res => {
                    message_toedit[chat.id][5] = res.message_id
                    message_text[chat.id][5] = res.text
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
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/adress'] = user_adress[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_price'] = average_price[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/email'] = user_email[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/favourite_food'] = favourite_food[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/id'] = chat.id
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/name'] = user_name[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/phone'] = user_phone[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/username'] = username[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]


                updates['Motherbase/clients/' + chat.id + '/adress'] = user_adress[chat.id]

                updates['Motherbase/clients/' + chat.id + '/food/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/favourite_food'] = favourite_food[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/average_price'] = average_price[chat.id]

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))

                order_name[chat.id] = 'Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/bills/' + time_now.getTime()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = (time_now.getTime()).toString()

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
            
                updates[order_name[chat.id] + '/date_ordered'] = time_now.getTime()
                updates[order_name[chat.id] + '/order_info'] = finalbasket[chat.id]
                updates[order_name[chat.id] + '/price'] = finalprice[chat.id],
                updates[order_name[chat.id] + '/client_id'] = chat.id
                updates[order_name[chat.id] + '/phone'] = user_phone[chat.id]
                updates[order_name[chat.id] + '/order_status'] = order_statuses_text[0]
                updates[order_name[chat.id] + '/adress'] = user_adress[chat.id]
                updates[order_name[chat.id] + '/client_name'] = user_name[chat.id]
                updates[order_name[chat.id] + '/user_payingmethod'] =user_payingmethod[chat.id]
                updates[order_name[chat.id] + '/user_deliverdate'] = user_deliverdate[chat.id]
                updates[order_name[chat.id] + '/user_sdachainfo'] = user_sdachainfo[chat.id]
                updates[order_name[chat.id] + '/user_howtocome'] = user_howtocome[chat.id]

                if (point_pplamount[chat.id] !== false){
                    updates[order_name[chat.id] + '/user_personsamount'] = user_personsamount[chat.id]
                }

                if (userstatus[chat.id] === 'unregistered'){
                    userstatus[chat.id] = 'registered'
                }
                
                fb.database().ref().update(updates)

                AddMailingData(chat.id)
                StartCheckingOrder(chat.id)

                if (coupondata[chat.id] !== undefined) {
                    let point_info4 = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients')
                    point_info4.get().then((csnap) => {
                        if (csnap.exists()){
                            let upd = {}
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = csnap.val().activ_left - 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = csnap.val().activated + 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = csnap.val().clients + ',' + chat.id    
                            fb.database().ref().update(upd)
                        }
                        
                    })
                }

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = time_now.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = time_now.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + time_now.getDate() + '.' + (time_now.getMonth() + 1)

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

if (coupondata[chat.id] !== undefined){
    deliver_bill_finalprice += `Использован купон ` + coupondata[chat.id][0] + `. Скидка ` + coupondata[chat.id][1] + `% учтена в итоговой стоимости

`
}

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>`
    if (point_pplamount[chat.id] !== false){
        deliver_bill_help_info += `
├ Кол-во персон: ` + user_personsamount[chat.id]
    }
    deliver_bill_help_info += `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + message_id)
    console.log('delivery_chat: ' + delivery_chat[chat.id])
    bot.sendMessage(delivery_chat[chat.id], delivers_bill, {
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
    })

            })
        }
        else {
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        inline_keyboard: unregistered_keyboard[3],
                    }
                }).then(res => {
                    message_toedit[chat.id][5] = res.message_id
                    message_text[chat.id][5] = res.text
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
                
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/adress'] = user_adress[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_price'] = average_price[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/email'] = user_email[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/favourite_food'] = favourite_food[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/id'] = chat.id
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/name'] = user_name[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/phone'] = user_phone[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/username'] = username[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
               
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_purchases'] = average_purchases[chat.id]

                updates['Motherbase/clients/' + chat.id + '/adress'] = user_adress[chat.id]

                updates['Motherbase/clients/' + chat.id + '/food/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/favourite_food'] = favourite_food[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/average_price'] = average_price[chat.id]

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chat.id] = 'Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/bills/' + time_now.getTime()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = (time_now.getTime()).toString()

                updates[order_name[chat.id] + '/date_ordered'] = time_now.getTime()
                updates[order_name[chat.id] + '/order_info'] = finalbasket[chat.id]
                updates[order_name[chat.id] + '/price'] = finalprice[chat.id],
                updates[order_name[chat.id] + '/client_id'] = chat.id
                updates[order_name[chat.id] + '/phone'] = user_phone[chat.id]
                updates[order_name[chat.id] + '/order_status'] = order_statuses_text[0]
                updates[order_name[chat.id] + '/adress'] = user_adress[chat.id]
                updates[order_name[chat.id] + '/client_name'] = user_name[chat.id]
                updates[order_name[chat.id] + '/user_payingmethod'] =user_payingmethod[chat.id]
                updates[order_name[chat.id] + '/user_deliverdate'] = user_deliverdate[chat.id]
                updates[order_name[chat.id] + '/user_sdachainfo'] = user_sdachainfo[chat.id]
                updates[order_name[chat.id] + '/user_howtocome'] = user_howtocome[chat.id]
            
                if (point_pplamount[chat.id] !== false){
                    updates[order_name[chat.id] + '/user_personsamount'] = user_personsamount[chat.id]
                }

                if (userstatus[chat.id] === 'unregistered'){
                    userstatus[chat.id] = 'registered'
                }

                fb.database().ref().update(updates)

                AddMailingData(chat.id)
                StartCheckingOrder(chat.id)

                if (coupondata[chat.id] !== undefined) {
                    let point_info4 = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients')
                    point_info4.get().then((csnap) => {
                        if (csnap.exists()){
                            let upd = {}
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = csnap.val().activ_left - 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = csnap.val().activated + 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = csnap.val().clients + ',' + chat.id    
                            fb.database().ref().update(upd)
                        }
                        
                    })
                }

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = time_now.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = time_now.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + time_now.getDate() + '.' + (time_now.getMonth() + 1)
    
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
if (coupondata[chat.id] !== undefined){
    deliver_bill_finalprice += `Использован купон ` + coupondata[chat.id][0] + `. Скидка ` + coupondata[chat.id][1] + `% учтена в итоговой стоимости

`
}

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + visible_date + `

`

deliver_bill_help_info = `<b>📌 Доп. информация</b>`
    if (point_pplamount[chat.id] !== false){
        deliver_bill_help_info += `
├ Кол-во персон: ` + user_personsamount[chat.id]
    }
    deliver_bill_help_info += `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])

    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + message_id)
    bot.sendMessage(delivery_chat[chat.id], delivers_bill, {
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
    })
    
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
        }

        if (isMakingChanges_2[chatId] !== 3 && isMakingChanges_2[chatId] !== 4){
            bot.deleteMessage(chatId, message_id).catch(err => {
                console.log(add_info_msg[chatId] + ' | ' + message_id + ' | ' + err)
            })
            
            if (point_pplamount[chat.id] !== false){
                bot.editMessageText(dopblank_text, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][1],
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: '💵: ' + user_payingmethod[chat.id],
                                callback_data: changepaying_method
                            }],
                            [{
                                text: '👥: ' + user_personsamount[chat.id],
                                callback_data: changeamountof_persons
                            },
                            {
                                text: '🕒: ' + user_deliverdate[chat.id],
                                callback_data: changedeliver_date
                            }],
                            [{
                                text: backtoaskinfo[0],
                                callback_data: backtoaskinfo[1]
                            },
                            {
                                text: dataiscorrect_text,
                                callback_data: dataiscorrect2_text
                            }]
                        ]
                    }
                }).then(res => {
                    message_text[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                    //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
                })
            }
            
            if (point_pplamount[chat.id] === false){
                bot.editMessageText(dopblank_text, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][1],
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: '🕒: ' + user_deliverdate[chat.id],
                                callback_data: changedeliver_date
                            },
                            {
                                text: '💵: ' + user_payingmethod[chat.id],
                                callback_data: changepaying_method
                            }],
                            [{
                                text: backtoaskinfo[0],
                                callback_data: backtoaskinfo[1]
                            },
                            {
                                text: dataiscorrect_text,
                                callback_data: dataiscorrect2_text
                            }]
                        ]
                    }
                }).then(res => {
                    message_text[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                    //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
                })
            }
        }
        
    }

    if (isWritingBusiness[chat.id] !== 0 && business_info[chat.id] !== undefined){
        bot.deleteMessage(chat.id, msg.message_id)
        if (isWritingBusiness[chat.id] === 1){
            isWritingBusiness[chat.id] = 0
            business_info[chat.id][10] = msg.text

            if (business_info[chat.id][11] === '' || business_info[chat.id][10] === ''){
                bot.editMessageText(message_text[chat.id][16], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][16],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                callback_data: business_cbcs[3]
                            }],
                            [{
                                text: '📞 Номер: ' + business_info[chat.id][11],
                                callback_data: business_cbcs[4]
                            }]
                        ]
                    }
                })
            }
    
            if (business_info[chat.id][11] !== '' && business_info[chat.id][10] !== ''){
                bot.editMessageText(message_text[chat.id][16], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][16],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                callback_data: business_cbcs[3]
                            }],
                            [{
                                text: '📞 Номер: ' + business_info[chat.id][11],
                                callback_data: business_cbcs[4]
                            }],
                            [{
                                text: 'Продолжить ➡️',
                                callback_data: business_cbcs[5]
                            }]
                        ]
                    }
                })
            }
        }

        if (isWritingBusiness[chat.id] === 2){
            if (msg.contact !== undefined){
                isWritingBusiness[chat.id] = 0
                business_info[chat.id][11] = msg.contact.phone_number

                if (business_info[chat.id][11] === '' || business_info[chat.id][10] === ''){
                    bot.deleteMessage(chat.id, message_toedit[chat.id][16])
                    .then(() => {
                        bot.sendMessage(chat.id, message_text[chat.id][16], {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                        callback_data: business_cbcs[3]
                                    }],
                                    [{
                                        text: '📞 Номер: ' + business_info[chat.id][11],
                                        callback_data: business_cbcs[4]
                                    }]
                                ]
                            }
                        })
                        .then(res => {
                            message_toedit[chat.id][16] = res.message_id
                        })
                    })
                }
        
                if (business_info[chat.id][11] !== '' && business_info[chat.id][10] !== ''){
                    bot.deleteMessage(chat.id, message_toedit[chat.id][16])
                    .then(() => {
                        bot.sendMessage(chat.id, message_text[chat.id][16], {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                        callback_data: business_cbcs[3]
                                    }],
                                    [{
                                        text: '📞 Номер: ' + business_info[chat.id][11],
                                        callback_data: business_cbcs[4]
                                    }],
                                    [{
                                        text: 'Продолжить ➡️',
                                        callback_data: business_cbcs[5]
                                    }]
                                ]
                            }
                        })
                        .then(res => {
                            message_toedit[chat.id][16] = res.message_id
                        })
                    })
                    
                }
            }
            else {
                isWritingBusiness[chat.id] = 0
                if (msg.text === '⬅️ Назад'){
                    if (business_info[chat.id][11] === '' || business_info[chat.id][10] === ''){
                        bot.deleteMessage(chat.id, message_toedit[chat.id][16])
                        .then(() => {
                            bot.sendMessage(chat.id, message_text[chat.id][16], {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                            callback_data: business_cbcs[3]
                                        }],
                                        [{
                                            text: '📞 Номер: ' + business_info[chat.id][11],
                                            callback_data: business_cbcs[4]
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                message_toedit[chat.id][16] = res.message_id
                            })
                        })
                    }
            
                    if (business_info[chat.id][11] !== '' && business_info[chat.id][10] !== ''){
                        bot.deleteMessage(chat.id, message_toedit[chat.id][16])
                        .then(() => {
                            bot.sendMessage(chat.id, message_text[chat.id][16], {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                            callback_data: business_cbcs[3]
                                        }],
                                        [{
                                            text: '📞 Номер: ' + business_info[chat.id][11],
                                            callback_data: business_cbcs[4]
                                        }],
                                        [{
                                            text: 'Продолжить ➡️',
                                            callback_data: business_cbcs[5]
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                message_toedit[chat.id][16] = res.message_id
                            })
                        })
                        
                    }
                }
                else {
                    if (business_info[chat.id][11] === '' || business_info[chat.id][10] === ''){
                        bot.deleteMessage(chat.id, message_toedit[chat.id][16])
                        .then(() => {
                            bot.sendMessage(chat.id, 'Вам нужно нажать на кнопку "📞 Отправить телефон". Не нужно вводить номер вручную', {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                            callback_data: business_cbcs[3]
                                        }],
                                        [{
                                            text: '📞 Номер: ' + business_info[chat.id][11],
                                            callback_data: business_cbcs[4]
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                message_toedit[chat.id][16] = res.message_id
                            })
                        })
                    }
            
                    if (business_info[chat.id][10] !== ''){
                        bot.deleteMessage(chat.id, message_toedit[chat.id][16])
                        .then(() => {
                            bot.sendMessage(chat.id, 'Вам нужно нажать на кнопку "📞 Отправить телефон". Не нужно вводить номер вручную', {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                            callback_data: business_cbcs[3]
                                        }],
                                        [{
                                            text: '📞 Номер: ' + business_info[chat.id][11],
                                            callback_data: business_cbcs[4]
                                        }],
                                        [{
                                            text: 'Продолжить ➡️',
                                            callback_data: business_cbcs[5]
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                message_toedit[chat.id][16] = res.message_id
                            })
                        })
                        
                    }
                }
            }
        }
    }

    if (text === order_status_button){
        bot.deleteMessage(chatId, message_id).then(() => {
            console.log('Order name: "' + order_name[chatId] + '"')
            let userdata = fb.database().ref(order_name[chatId])
            userdata.get().then((result) => {
                order_status[chatId] = result.val().order_status
                console.log('order_status: ' + result.val().order_status)
                console.log('order link: Basement/bills/' + order_name[chatId])
                bot.sendMessage(chatId, 'Статус вашего заказа: ' + order_status[chatId])
            }) 
        })
    }

    if (text === finish_order_text){
        bot.deleteMessage(chatId, message_id - 1)
        bot.deleteMessage(chatId, message_id).then(() => {

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
                updates['Basement/clients/' + chatId + '/coins'] = user_coins[chatId]
                fb.database().ref().update(updates).then(() => {
                    //тут отправить в главное меню
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, message_id - i).catch(err => {
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

    if (text === dont_add_email){
        isMakingChanges[chatId] = 0
        //теперь можно совершать новые покупки, но ты регистеред

        let updates = {};
        updates['Basement/clients/' + chatId + '/coins'] = user_coins[chatId]
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chatId, didntaddemail_text).then(() => {
                Reset(chatId)
                anotherpoint_multiple[chatId] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chatId], userPoint[chatId], user_mode[chatId], message_toedit[chat.id], message_text[chat.id])
            })
        })

    }
})

bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message
    const chatId = query.message.chat.id
    console.log(query.data)
    console.log('coupondata ' + coupondata[chat.id])
    console.log(query)

    if (business_info[chat.id] !== undefined){
        if (query.data === business_cbcs[0]){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log(err)})
            
            bot.sendVideo(chat.id, business_info[chat.id][6], {
                parse_mode: 'HTML',
                caption: 'Мы упрощаем и улучшаем сервис, который вы оказываете своим клиентам. Это повышает число заказов, ведь чем лучше клиенту, тем лучше Вам!',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Почему именно мы?',
                            callback_data: business_cbcs[1]
                        }]
                    ]
                }
            })
        }
        if (query.data === business_cbcs[1]){
            bot.editMessageCaption(query.message.caption, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log(err)})
            
            let txt = `У нас 3 фишки, которые выделяют нас среди конкурентов - агрегаторов, мобильных приложений и заказу по телефону. Об этом мы расскажем Вам на личной встрече, но если коротко: 

1. Мы берем не % с продаж, а фиксированную цену вне зависимости от вашего дохода. Это в 7+ раз дешевле, чем при использовании агрегаторов (Wolt, Glovo, Яндекс и тд.), которые <b>берут 20% при Вашей рентабельности в 15-25%</b> 🤦‍♂️

2. Вашим клиентам не нужно скачивать отдельное приложение, телеграм это топ-3 мессенджера страны, <b>он есть у всех</b>. Немного статистики: когда вы указываете ссылку на свой ресторан в агрегаторе, заказ делают 60-70% клиентов. <b>В нашем случае - 90%.</b> Про заказ через WhatsApp и телефон молчим - ниже 3%

3. Мы даем инструменты аналитики и показываем, как ваши курьеры справляются с работой, как долго везут заказ и какие отзывы получают. Также наш сервис позволяет стимулировать доп. продажи через <b>рассылки, акции и скидки</b>`

            bot.sendPhoto(chat.id, business_info[chat.id][7], {
                parse_mode: 'HTML',
                caption: txt
            })
            .then(() => {
                bot.sendMessage(chat.id, `Скажите, что именно доставляет ваша компания?`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Еда 🍔',
                                callback_data: business_cbcs[2] + '_FOOD'
                            },
                            {
                                text: 'Продукты 🍏',
                                callback_data: business_cbcs[2] + '_PRODUCTY'
                            }],
                            [{
                                text: 'Цветы 🌹',
                                callback_data: business_cbcs[2] + '_FLOWERS'
                            },
                            {
                                text: 'Одежда 👕',
                                callback_data: business_cbcs[2] + '_CLOTH'
                            }],
                            [{
                                text: 'Алкоголь 🥃',
                                callback_data: business_cbcs[2] + '_ALCOHOL'
                            },
                            {
                                text: 'Табак/Вейпы 💨',
                                callback_data: business_cbcs[2] + '_TOBACCO'
                            }],
                            [{
                                text: 'Вода/Напитки 💦',
                                callback_data: business_cbcs[2] + '_WATER'
                            },
                            {
                                text: 'Другое ➡️',
                                callback_data: business_cbcs[2] + '_OTHER'
                            }]
                        ]
                    }
                })
            })
        }

        if (query.data.includes(business_cbcs[2])){
            let type_text = query.data.split('_')
            type_text = type_text[1]
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
            message_text[chat.id][15] += `

<b>Бизнес</b>
├<b>Категория:</b> ` + type_text

            let updates_second = {}
            updates_second['Motherbase/customers/list/' + chat.id + '/firm_category'] = type_text
            fb.database().ref().update(updates_second)

            bot.editMessageCaption(message_text[chat.id][15], {
                parse_mode: 'HTML',
                chat_id: business_info[chat.id][8],
                message_id: message_toedit[chat.id][15]
            }).catch(err => {
                console.log('here ' + err.name + `\n\n ` + err.message)
                bot.editMessageText(message_text[chat.id][15], {
                    parse_mode: 'HTML',
                    chat_id: business_info[chat.id][8],
                    message_id: message_toedit[chat.id][15]
                }).catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
            })
            business_info[chat.id][10] = ''
            business_info[chat.id][11] = ''
            isWritingBusiness[chat.id] = 0

            bot.sendVideoNote(chat.id, business_info[chat.id][12]).then(() => {
                bot.sendMessage(chat.id, 'Дайте нам узнать о Вас больше, а в обмен мы отправим Вам <b>тарифы нашего сервиса</b> 😇', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                callback_data: business_cbcs[3]
                            }],
                            [{
                                text: '📞 Номер: ' + business_info[chat.id][11],
                                callback_data: business_cbcs[4]
                            }]
                        ]
                    }
                })
                .then(res => {
                    message_toedit[chat.id][16] = res.message_id
                    message_text[chat.id][16] = res.text

                }).catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
            
            }).catch(err => {
                console.log('here ' + err.name + `\n\n ` + err.message)

                bot.sendMessage(chat.id, 'Дайте нам узнать о Вас больше, а в обмен мы отправим Вам <b>тарифы нашего сервиса</b> 😇', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'ℹ️ Название компании: ' + business_info[chat.id][10],
                                callback_data: business_cbcs[3]
                            }],
                            [{
                                text: '📞 Номер: ' + business_info[chat.id][11],
                                callback_data: business_cbcs[4]
                            }]
                        ]
                    }
                })
                .then(res => {
                    message_toedit[chat.id][16] = res.message_id
                    message_text[chat.id][16] = res.text

                }).catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
            })
        
        }

        if (query.data === business_cbcs[3]){
            isWritingBusiness[chat.id] = 1
            bot.editMessageText('Как называется компания, в которой вы работаете? (напишите)', {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][16]
            })
        }

        if (query.data === business_cbcs[4]){
            isWritingBusiness[chat.id] = 2
            bot.deleteMessage(chat.id, message_toedit[chat.id][16])
            .then(() => {
                bot.sendPhoto(chat.id, openkeyboard_pic, {
                    parse_mode: 'HTML',
                    caption: 'Нажмите на кнопку снизу, чтобы отправить телефон. Если Кнопки нет, найдите иконку справа от клавиатуры, как показано на картинке',
                    reply_markup: {
                        keyboard: [
                            [{
                                text: '📞 Отправить телефон',
                                request_contact: true
                            }],
                            [{
                                text: '⬅️ Назад',
                            }]
                        ],
                        resize_keyboard: true
                    }
                }).then(res => {
                    message_toedit[chat.id][16] = res.message_id
                })
            })
        }

        if (query.data === business_cbcs[5]){
            message_text[chat.id][15] += `
├<b>Название:</b> ` + business_info[chat.id][10] + `
└<b>Номер:</b> ` + business_info[chat.id][11]

            let updates_last = {}
            updates_last['Motherbase/customers/list/' + chat.id + '/firm_name'] = business_info[chat.id][10]
            updates_last['Motherbase/customers/list/' + chat.id + '/contact_phone'] = business_info[chat.id][11]
            fb.database().ref().update(updates_last)
            
            bot.editMessageCaption(message_text[chat.id][15], {
                parse_mode: 'HTML',
                chat_id: business_info[chat.id][8],
                message_id: message_toedit[chat.id][15]
            }).catch(err => {
                console.log('here ' + err.name + `\n\n ` + err.message)
                bot.editMessageText(message_text[chat.id][15], {
                    parse_mode: 'HTML',
                    chat_id: business_info[chat.id][8],
                    message_id: message_toedit[chat.id][15]
                }).catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
            })
        
            bot.deleteMessage(chat.id, message_toedit[chat.id][16])

            let tx = 'Спасибо, что проявляете интерес к Resify! Мы постараемся связаться с Вами сегодня и ответить на все Ваши вопросы. Вы можете опробовать бота прямо сейчас. Для этого нажмите на кнопку ниже. <b>Но только сохраните перед этим всю информацию, которую мы Вам отправили. </b>Это важно 😉'
            bot.sendPhoto(chat.id, business_info[chat.id][9], {
                parse_mode: 'HTML',
                caption: tx,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Опробовать доставку',
                            callback_data: business_cbcs[6]
                        }],
                        [{
                            text: 'Больше информации',
                            url: 'https://t.me/resifybusiness'
                        }]
                    ]
                }
            }).catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
        }

        if (query.data === business_cbcs[6]){
            business_info[chat.id] === undefined
            Reset(chat.id)
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chatId, sticker_hello).then(() => {
                anotherpoint_multiple[chatId] = 2
                //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                bot.sendMessage(chatId, hellomessage_text, {
                    parse_mode: 'HTML',
                })
                keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
            })
        }
    }
    
    if (chat.type === 'private'  && UserDelCats[chat.id] === undefined && business_info[chat.id] === undefined){
        Reset(chat.id)
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello).then(() => {
            anotherpoint_multiple[chatId] = 2
            //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
            bot.sendMessage(chatId, hellomessage_text, {
                parse_mode: 'HTML',
            })
            keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
            //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
            //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
        })
    }

    if (chat.type === 'private'  && chat.id !== admin_id && UserDelCats[chat.id] !== undefined && business_info[chat.id] === undefined){
        current_chat = chat.id
        

    if (query.data === query_deletethismessage){
        bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
    }

    if (query.data === business_cbcs[7]){
        business_info[chat.id] = []
        business_info[chat.id][0] = 0 //message_id который прилетит мне
        business_info[chat.id][1] = chat.first_name
        if (chat.last_name === undefined){
            business_info[chat.id][2] = 'Не указано'
        }
        if (chat.last_name !== undefined){
            business_info[chat.id][2] = chat.last_name
        }

        if (chat.username === undefined){
            business_info[chat.id][4] = 'Не указано'
        }
        if (chat.username !== undefined){
            business_info[chat.id][4] = chat.username
        }

        bot.getUserProfilePhotos(chat.id).then(res => {
            business_info[chat.id][5] = res.photos[0][0].file_id
            console.log(res.photos[0][0].file_id)
            /* for(let i = 0; i< res.photos[0].length; i++){
                
            } */
            //business_info[chat.id][5] = res.photos[0]
        }).catch(err => {console.log(err)})

        business_info[chat.id][3] = chat.id

        let first_info = {
            id: business_info[chat.id][3],
            first_name: business_info[chat.id][1],
            last_name: business_info[chat.id][2],
            username: business_info[chat.id][4]
        }
                 
        let updates_first = {}
        updates_first['Motherbase/customers/list/' + chat.id] = first_info
        fb.database().ref().update(updates_first)

        let mb_data = fb.database().ref('Motherbase/')
        mb_data.get().then((result) => {

            business_info[chat.id][6] = result.val().customers.links.media.howitworks
            business_info[chat.id][7] = result.val().customers.links.media.comparison
            business_info[chat.id][8] = result.val().chats.business_id
            business_info[chat.id][9] = result.val().customers.links.media.pricing
            business_info[chat.id][12] = result.val().customers.links.media.videonote

            let txt_me = `🥳 <b>Новый клиент</b>
├ <b>Имя:</b> ` + business_info[chat.id][1] + ' ' + business_info[chat.id][2] + `
└ <b>Username, Id:</b> @` + business_info[chat.id][4] + `, ` + business_info[chat.id][3]
            bot.sendPhoto(result.val().chats.business_id,  business_info[chat.id][5], {
                parse_mode: 'HTML',
                caption: txt_me
            }).catch(err => {
                console.log('here ' + err.name + `\n\n ` + err.message)
                bot.sendMessage(result.val().chats.business_id, txt_me, {
                    parse_mode: 'HTML'
                })
                .then(res => {
                    message_toedit[chat.id] = []
                    message_toedit[chat.id][15] = res.message_id
                    message_text[chat.id] = []
                    message_text[chat.id][15] = res.text
                })
                .catch(err => {
                    console.log('here ' + err.name + `\n\n ` + err.message)
                })
            }).then(res => {
                message_toedit[chat.id] = []
                message_toedit[chat.id][15] = res.message_id
                message_text[chat.id] = []
                message_text[chat.id][15] = res.caption
            }) 
            
        })

        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello).then(() => {
            let txt = `👋 Здравствуйте, ` +  chat.first_name + `. Я - Resify, еще один агрегатор доставки. 
Но в отличие от конкурентов, <b>мы не берем % от продажи</b>. За небольшую ежемесячную плату вы сможете организовать онлайн-доставку, увеличить поток клиентов и их удержание`
            bot.sendMessage(chat.id, txt, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Как это работает?',
                            callback_data: business_cbcs[0]
                        }]
                    ]
                }
            })
        })

    }

    if (query.data === reallystartagain[1]){
        coupondata[chat.id] = undefined
        Reset(chatId)

        if (chatId !== delivery_chat[chatId]){
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chatId, sticker_hello).then(() => {
                anotherpoint_multiple[chatId] = 2
                //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                bot.sendMessage(chatId, hellomessage_text, {
                    parse_mode: 'HTML',
                })
                keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
            })
            
        }
    }

    if (query.data === declineorder_button[1]){
        let updates = {}
        updates[order_name[chatId]] = null
        bot.deleteMessage(chatId, message_id)
        fb.database().ref().update(updates).then(() => {
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chatId, sticker_baddeliver).then(() => {
                bot.sendMessage(chatId, '😢 Жаль, что вы решили отменить заказ. Может, закажем что-нибудь в другом заведении?').then(() => {
                    //Reset(chatId)
                    anotherpoint_multiple[chatId] = 2
                    userPoint[chat.id] = 0
                    userCategory[chat.id] = ''
                    userFood[chat.id] = ''
                    userFoodlist[chat.id] = []
                    order_name[chatId] = 0
                    coupondata[chat.id] = undefined
                    
                    basket[chat.id] = []
                    finalprice[chatId] = 0
                    finalbasket[chatId] = ''
                    temp_backet_food[chatId] = 0
                    temp_food_text[chatId] = ''
                    temp_food_price[chatId] = 0
                    temp_foodamount[chatId] = 1
                    skidka[chatId] = 0
                    keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], UserDelCat[chat.id], fb, bot, chat.id, change_delcat_text, choosepoint_text, user_mode[chat.id], sendlocation, message_toedit[chat.id], message_text[chat.id])
                    //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chatId], userPoint[chatId], user_mode[chatId], message_toedit[chat.id], message_text[chat.id])
                })
            })
            
        }).catch(err => {
            console.log(err)
        })
    }

    if (query.data === finish_order_text[1]){
        let poll_text = 'Спасибо за заказ! Пожалуйста, оцените качество доставки: '
        if (message_toedit[chat.id][5] !== undefined){
            bot.editMessageText(poll_text, {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][5]
            }).then(() => {
                bot.sendPoll(chatId, 'Как оцените наш сервис?', feedback_options, {
                    is_anonymous: false
                })
            })
        }
        else {
            bot.sendMessage(chat.id, poll_text).then(() => {
                bot.sendPoll(chatId, 'Как оцените наш сервис?', feedback_options, {
                    is_anonymous: false
                })
            })
        }
        let userdata1 = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/other_info/delivery_time')
        userdata1.get().then((result) => {
            console.log('newtime0: ' + order_name[chat.id] + '/accept_date')
            let userdata2 = fb.database().ref(order_name[chat.id] + '/accept_date')
            userdata2.get().then((result1) => {
                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))
                let newTime = time_now.getTime() - result1.val()
                if (result.val() !== 0 && result.val() !== undefined && result.val() !== 'unknown'){
                    newTime = (newTime + result.val()) / 2
                }
                if (newTime > 900000){
                    let updates = {}
                    console.log('newtime: ' + newTime)
                    updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/other_info/stats/delivery_time'] = newTime
                    fb.database().ref().update(updates)
                }
            })
        })
    }

    if (query.data === sendadress_point[1]){
        console.log('msg: ' + message_toedit[chat.id][3])
        if (message_toedit[chat.id][3] !== undefined){
            bot.deleteMessage(chat.id, message_toedit[chat.id][3])
            .catch(err => {console.log('here: ' + err)})
        }
        bot.sendVenue(chat.id, point_location[chat.id][0], point_location[chat.id][1], 'Адрес:', point_adress[chat.id])
        .then(res => {
            message_toedit[chat.id][3] = res.message_id
        })
    }

    if (query.data === sendphone_point[1]){
        console.log('msg: ' + message_toedit[chat.id][4])
        if (message_toedit[chat.id][4] !== undefined){          
            bot.deleteMessage(chat.id, message_toedit[chat.id][4])
            .catch(err => {console.log('here: ' + err)})
        }
        bot.sendContact(chat.id, help_phone[chat.id], 'Номер курьерской службы')
        .then(res => {
            message_toedit[chat.id][4] = res.message_id
        })
    }

    for(let i = 0; i<UserDelCats[chat.id].length; i++){
        if (query.data === UserDelCats[chat.id][i]){
            UserDelCat[chat.id] = UserDelCats[chat.id][i]
            bot.deleteMessage(chat.id, message_toedit[chat.id][0])
            coupondata[chat.id] = undefined
            basket[chat.id] = []
            finalprice[chatId] = 0
            finalbasket[chatId] = ''
            temp_backet_food[chatId] = 0
            temp_food_text[chatId] = ''
            temp_food_price[chatId] = 0
            temp_foodamount[chatId] = 1
            skidka[chatId] = 0
            
            keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], UserDelCat[chat.id], fb, bot, chat.id, change_delcat_text, choosepoint_text, user_mode[chat.id], sendlocation, message_toedit[chat.id], message_text[chat.id])
        }
    }

    if (query.data === anotherpoint_text){
        userPoint[chat.id] = ''
        bot.deleteMessage(chat.id, message_toedit[chat.id][0])
        if (message_toedit[chat.id][3] != undefined) {
            bot.deleteMessage(chat.id, message_toedit[chat.id][3])
        }
        if (message_toedit[chat.id][4] != undefined) {
            bot.deleteMessage(chat.id, message_toedit[chat.id][4])
        }
        basket[chat.id] = []
        finalprice[chatId] = 0
        finalbasket[chatId] = ''
        temp_backet_food[chatId] = 0
        temp_food_text[chatId] = ''
        temp_food_price[chatId] = 0
        temp_foodamount[chatId] = 1
        skidka[chatId] = 0
        coupondata[chat.id] = undefined
        keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], UserDelCat[chat.id], fb, bot, chat.id, change_delcat_text, choosepoint_text, user_mode[chat.id], sendlocation, message_toedit[chat.id], message_text[chat.id])
    }

    if (query.data === change_delcat_text){
        userPoint[chat.id] = ''
        UserDelCat[chat.id] = ''
        bot.deleteMessage(chat.id, message_toedit[chat.id][0])
        keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
    }

    if (query.data === anotherusermode_text){
        user_mode[chat.id] = 'unknown'
        Reset(chat.id)
        for (let i=0; i<100; i++){
            bot.deleteMessage(chat.id, message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chat.id, sticker_hello).then(() => {
            bot.sendMessage(chat.id, hellomessage_text, {
                parse_mode: 'HTML',
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: usermodes[0][0],
                            callback_data: usermodes[0][1]
                        }],
                        [{
                            text: usermodes[1][0],
                            callback_data: usermodes[1][1]
                        }]
                    ]
                }
            })
        })
        
    }
    if (query.data === writecoupon[1]){
        isWritingCoupon[chat.id] = 1
        bot.deleteMessage(chatId, message_id)
        bot.sendMessage(chatId, 'У Вас есть промокод на скидку? Тогда введите его:', {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: mybasket_text
                    }]
                ]
            }
        })
        .then(res => {
            message_toedit[chatId][2] = res.message_id
        })
    }
    if (query.data === mybasket_text){
        if (order_status[chatId] === 'unknown'){
            if (buttons_message[chatId] !== 0){
                console.log('basket: ' + basket[chat.id])
                bot.deleteMessage(chatId, buttons_message[chatId]).catch(err => {
                    console.log(err)
                })
                if (message_toedit[chat.id][1] !== undefined){
                    bot.deleteMessage(chatId, message_toedit[chat.id][1]).catch(err => {
                        console.log(err)
                    })
                }
                bot.deleteMessage(chatId, message_id).then(() => {
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    for (let i = 0; i < basket[chatId].length; i++){
                                    finalsum += (basket[chatId][i][2] * basket[chatId][i][1])   
                                    if (i === basket[chatId].length - 1){
                                        if (coupondata[chat.id] !== undefined){
                                            editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                                            finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                                            console.log('1finalsum: ' +finalsum)
                                            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                                editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                            }
                                        }
                                        else if (coupondata[chat.id] === undefined){
                                            editmsg += finalsum + 'тг.'
                                            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                                editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                            }
                                        }

                                        finalprice[chatId] = finalsum + delivery_price[chat.id]
                                        console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)
                                        for (let i = 0; i < basket[chatId].length; i++){
                                            console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                            editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                            if (i === basket[chatId].length - 1){
                                                
                                                bot.sendMessage(chatId,  editmsg , {
                                                    reply_markup:{
                                                        inline_keyboard: [
                                                            [{
                                                                text: anotherfood_text2[0],
                                                                callback_data: anotherfood_text2[1]
                                                            },
                                                            {
                                                                text: editbasket_text,
                                                                callback_data: editbasket_text
                                                            }],
                                                            [{
                                                                text: writecoupon[0],
                                                                callback_data: writecoupon[1]
                                                            }],
                                                            [{
                                                                text: paybasket_text[0],
                                                                callback_data: paybasket_text[1]
                                                            }]
                                                        ]
                                                    }
                                                }).then(() => {
                                                    buttons_message[chatId] = message_id
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
            else {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_hello).then(() => {
                    anotherpoint_multiple[chatId] = 2
                    //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                    bot.sendMessage(chatId, hellomessage_text, {
                        parse_mode: 'HTML',
                    })
                    keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                    coupondata[chat.id] = undefined
                    basket[chat.id] = []
                    finalprice[chatId] = 0
                    finalbasket[chatId] = ''
                    temp_backet_food[chatId] = 0
                    temp_food_text[chatId] = ''
                    temp_food_price[chatId] = 0
                    temp_foodamount[chatId] = 1
                    skidka[chatId] = 0
                    //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                    //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
                })
            }
        }
        else {
            bot.deleteMessage(chatId, message_id)
        }
    }
    if (query.data === paybasket_text[1]){
        bot.deleteMessage(chatId, message_toedit[chatId][2])
        if (finalprice[chatId] - delivery_price[chat.id] < delivery_min_price[chat.id]){
            bot.sendMessage(chatId, 'Минимальная сумма заказа: ' + delivery_min_price[chat.id] + '. Закажите что-нибудь еще 😇')
            .then(res => {
                message_toedit[chatId][2] = res.message_id
            })
        }
        else {
            //bot.deleteMessage(chatId, message_id - 1)
            bot.deleteMessage(chatId, message_id).catch(err => {console.log('! ' + err)})
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chatId].length; i++){
                                finalsum += (basket[chatId][i][2] * basket[chatId][i][1])
                                if (i === basket[chatId].length - 1){
                                    if (coupondata[chat.id] !== undefined){
                                        editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                                        finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                                        console.log('1finalsum: ' +finalsum)
                                        if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                            editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                        }
                                    }
                                    else if (coupondata[chat.id] === undefined){
                                        editmsg += finalsum + 'тг.'
                                        if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                            editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                        }
                                    }
                                    console.log(finalsum + ' ' + i)
                                    finalprice[chatId] = finalsum + delivery_price[chat.id]
                                    for (let i = 0; i < basket[chatId].length; i++){
                                        console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                        editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                        if (i === basket[chatId].length - 1){
                                            finalbasket[chatId] = editmsg
                                            bot.sendMessage(chatId,  editmsg).then(res => {
                                                CheckUser(chatId, chat.first_name, chatId, message_id)
                                                message_toedit[chatId][2] = res.message_id
                                            })
                                        }
                                    }
                                }
                }
        }
        
    }
    if (query.data === loadcategories[1]){
        anotherpoint_multiple[chat.id] = 2
        bot.deleteMessage(chat.id, message_toedit[chat.id][0])
        if (message_toedit[chat.id][3] != undefined) {
            bot.deleteMessage(chat.id, message_toedit[chat.id][3])
        }
        if (message_toedit[chat.id][4] != undefined) {
            bot.deleteMessage(chat.id, message_toedit[chat.id][4])
        }
        keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id] , message_toedit[chat.id], message_text[chat.id])   
    }
    //тут создаем клавиатуру с категориями для гостя
    if (query.data === youchosepoint_text){
        //console.log(query.message.text)
        //bot.deleteMessage(chat.id, message_id-1)
        let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
        point_info.get().then((snapshot) => {

            help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
            point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
            point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
            point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude

            point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
            point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal

            delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
            delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
            point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
            point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount

            point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
            point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
            //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
            point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
            //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]

            point_rating[chat.id] = snapshot.val().other_info.stats.rating
            point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time

            delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
            console.log('325 ' + delivery_chat[chat.id])

            let buttons_data = []
            if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                buttons_data.push({
                    text: sendadress_point[0],
                    callback_data: sendadress_point[1]
                })
            }

            if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                buttons_data.push({
                    text: sendphone_point[0],
                    callback_data: sendphone_point[1] 
                })
            }

            let date = new Date()
            let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
            let timeOfffset = 6 //Astana GMT +6
            let time_now = new Date(utcTime + (3600000 * timeOfffset))

            let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
            let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
            console.log(time_now.getTime() < restriction_time_min)

            let ttd_ms = snapshot.val().other_info.stats.delivery_time
            let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
            let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
            let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)

            ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
            ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
            ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
            let ttd 
            if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
            }

            if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                ttd = ttd_minutes + ' мин.'
            }
            console.log('ttd_hours: ' + ttd_hours)

            let msgtext = `<b>` + snapshot.val().point_name + `</b>`

            if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                console.log('1 wrong TIME, time_now: ' + time_now)
                user_deliverdate[chat.id] = 'Как можно раньше'
                msgtext += ` (Закрыто)`
            }
            
            let rating
            if (point_rating[chat.id] < 1){
                rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
            }

            if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
            }

            if (point_rating[chat.id] > 2){
                rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
            }
            if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
            }
            if (snapshot.val().other_info.stats.delivery_time > 0) {
                msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
            }

            msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time

            if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
                msgtext += `
<b>💰 Мин. сумма заказа:</b> ` + delivery_min_price[chat.id] + ` тенге.`
            }

            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
                msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
            }

            if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
                msgtext += `
                
` + snapshot.val().other_info.delivery_info.disclaimer
            }
            
            if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                console.log('2 wrong TIME, time_now: ' + time_now)
                msgtext += `

<b>❗️ Внимание.</b> Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
            }

            let finalbuttons
            if (snapshot.val().chats.admin !== chat.id){
                finalbuttons = [{
                    text: anotherpoint_text,
                    callback_data: anotherpoint_text
                }],
                [{
                    text: loadcategories[0],
                    callback_data: loadcategories[1]
                }]
            }

            if (snapshot.val().chats.admin === chat.id){
                isAdmin[chat.id] = true
                finalbuttons = [{
                    text: anotherpoint_text,
                    callback_data: anotherpoint_text
                }],
                [{
                    text: openadminpanel[0],
                    callback_data: openadminpanel[1]
                }]
            }

            if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                    parse_mode: 'HTML',
                    caption: msgtext,
                    reply_markup: {
                        inline_keyboard: [
                            buttons_data,
                            finalbuttons
                        ]
                    }
                }).then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    message_text[chat.id][0] = res.caption
                })
                .catch(() => {
                    bot.sendMessage(chat.id, msgtext, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                buttons_data,
                                finalbuttons
                            ]
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][0] = res.message_id
                        message_text[chat.id][0] = res.text
                    })
                })
            }
            if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                bot.sendMessage(chat.id, msgtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            buttons_data,
                            finalbuttons
                        ]
                    }
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    message_text[chat.id][0] = res.text
                })
            }
            
        })
    }

    for (let i = 0; i < userCities[chat.id].length; i++){
        //console.log(userCategories[chat.id][i])
        if (query.data === userCities[chat.id][i]){
            console.log(userCities[chat.id][i])
            userCity[chat.id] = userCities[chat.id][i]
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            bot.deleteMessage(chat.id, message_toedit[chat.id][0])
            coupondata[chat.id] = undefined
            basket[chat.id] = []
            finalprice[chatId] = 0
            finalbasket[chatId] = ''
            temp_backet_food[chatId] = 0
            temp_food_text[chatId] = ''
            temp_food_price[chatId] = 0
            temp_foodamount[chatId] = 1
            skidka[chatId] = 0
            keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], UserDelCat[chat.id], fb, bot, chat.id, change_delcat_text, choosepoint_text, user_mode[chat.id], sendlocation, message_toedit[chat.id], message_text[chat.id])
        }
    }

    for (let i = 0; i < userPoints[chat.id].length; i++){
        //console.log(userCategories[chat.id][i])
        if (query.data === userPoints[chat.id][i]/*  && userCategory[chat.id] === '' */){
            userPoint[chat.id] = userPoints[chat.id][i]
            userCategory[chat.id] = 'unknown'
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            console.log('founded chosen point. Lets load categories... ' + userCategory[chat.id])
            basket[chat.id] = []
            let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
            point_info.get().then((snapshot) => {

            help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
            point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
            point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
            point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude

            point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
            point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal

            delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
            console.log('325 ' + delivery_chat[chat.id])

            delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
            delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
            point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
            point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount

            point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
            point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
            //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
            point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
            //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]

            point_rating[chat.id] = snapshot.val().other_info.stats.rating
            point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time

            let buttons_data = []
            if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                buttons_data.push({
                    text: sendadress_point[0],
                    callback_data: sendadress_point[1]
                })
            }

            if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                buttons_data.push({
                    text: sendphone_point[0],
                    callback_data: sendphone_point[1] 
                })
            }

            let date = new Date()
            let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
            let timeOfffset = 6 //Astana GMT +6
            let time_now = new Date(utcTime + (3600000 * timeOfffset))

            let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
            let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
            console.log(time_now.getTime() < restriction_time_min)
            console.log('min: ' + restriction_time_min)
            console.log('max: ' + restriction_time_max)

            let ttd_ms = snapshot.val().other_info.stats.delivery_time
            let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
            let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
            let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)

            ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
            ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
            ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;

            let ttd 
            if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
            }

            if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                ttd = ttd_minutes + ' мин.'
            }
            console.log('ttd_hours: ' + ttd_hours)

            let msgtext = `<b>` + snapshot.val().point_name + `</b>`
            if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                console.log('1 wrong TIME, time_now: ' + time_now)
                user_deliverdate[chat.id] = 'Как можно раньше'
                msgtext += ` (Закрыто)`
            }
            
            let rating
            if (point_rating[chat.id] < 1){
                rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
            }

            if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
            }

            if (point_rating[chat.id] > 2){
                rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
            }
            
            if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
            }
            if (snapshot.val().other_info.stats.delivery_time > 0) {
                msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
            }

            msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time

if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
    msgtext += `
<b>💰 Мин. сумма заказа: </b>` + delivery_min_price[chat.id] + ` тенге.`
}

if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
    msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
}

if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
    msgtext += `

` + snapshot.val().other_info.delivery_info.disclaimer
}
            
            if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                console.log('2 wrong TIME, time_now: ' + time_now)
                msgtext += `

<b>❗️ Внимание</b>. Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
            }

            let finalbuttons
            if (snapshot.val().chats.admin !== chat.id){
                finalbuttons = [{
                    text: anotherpoint_text,
                    callback_data: anotherpoint_text
                },
                {
                    text: loadcategories[0],
                    callback_data: loadcategories[1]
                }]
            }

            if (snapshot.val().chats.admin === chat.id){
                isAdmin[chat.id] = true
                finalbuttons = [{
                    text: anotherpoint_text,
                    callback_data: anotherpoint_text
                },
                {
                    text: openadminpanel[0],
                    callback_data: openadminpanel[1]
                }]
            }
            
            if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                    parse_mode: 'HTML',
                    caption: msgtext,
                    reply_markup: {
                        inline_keyboard: [
                            buttons_data,
                            finalbuttons
                        ]
                    }
                }).then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    message_text[chat.id][0] = res.caption
                })
                .catch(() => {
                    bot.sendMessage(chat.id, msgtext, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                buttons_data,
                                finalbuttons
                            ]
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][0] = res.message_id
                        message_text[chat.id][0] = res.text
                    })
                })
            }
            if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                bot.sendMessage(chat.id, msgtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            buttons_data,
                            finalbuttons
                        ]
                    }
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    message_text[chat.id][0] = res.text
                })
            }
        })
        }}

    for (let i = 0; i < userCategories[chat.id].length; i++){
        //console.log(userCategories[chat.id][i])
        //userCategory[chat.id] = userCategories[chat.id][i]
        //console.log('PRESSED ON CATEGORY!!! + ' + userCategories[chat.id][i] + ' ' + query.data)
        if (query.data === userCategories[chat.id][i]/*  && userFood[chat.id] === '' */){
            userCategory[chat.id] = userCategories[chat.id][i]
            userFood[chat.id] = 'unknown'
            console.log('PRESSED ON CATEGORY!!!')
            //bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            keyboards.FoodKeyboard(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, choosefood_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id])
        }
    }
    for (let i = 0; i < userFoodlist[chat.id].length; i++){
        if (query.data === userFoodlist[chat.id][i] && !query.data.includes('admn')){
            //console.log('Кнопку нашли')
            userFood[chat.id] = i
            let food_photo_link = ''
            let food_description = ''
            temp_food_price[chat.id] = ''
            bot.deleteMessage(chat.id, message_id).then(() => {
                let food_photo = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/' + user_mode[chat.id] + '/categories/' + userCategory[chat.id] + '/food/' + i)
                food_photo.get().then((snapshot) =>
                {
                    food_photo_link = snapshot.val().photo
                    food_description = snapshot.val().description
                    temp_food_price[chat.id] = snapshot.val().price

                    if (/*food_photo_link !== '' &&  food_description !== '' &&  */temp_food_price[chat.id] !== ''){
                        bot.sendPhoto(chat.id, food_photo_link).then(() => {
                            temp_food_text[chat.id] = `<b>` + userFoodlist[chat.id][userFood[chat.id]] + `</b>
` + food_description + `

<b> 💰 Цена: </b>` + temp_food_price[chat.id] + ` тенге`

                            let inline_kb
                            if (snapshot.val().is_active !== true){
                                temp_food_text[chat.id] += `

❗️ Этот товар пока что недоступен 🥺`
                                inline_kb = [
                                    [{
                                        text: anotherfood_text,
                                        callback_data: anotherfood_text
                                    }]
                                ]
                            }

                            if (snapshot.val().is_active === true){
                                inline_kb = [
                                    [{
                                        text: addto_basket_text /* changefoodamount_basket_text */,
                                        callback_data: addto_basket_text
                                    }],
                                    [{
                                        text: anotherfood_text,
                                        callback_data: anotherfood_text
                                    }]
                                ]
                            }
                            for (let i = 0; i < basket[chat.id].length; i++){
                                if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood[chat.id]]){
                                    console.log('foundfood ' + i)
                                    inline_kb[0] =
                                        [{
                                            text: changefoodamount_basket_text /* changefoodamount_basket_text */,
                                            callback_data: changefoodamount_basket_text
                                        }]
                                    bot.sendMessage(chat.id, temp_food_text[chat.id], {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard: inline_kb
                                        }
                                    })
                                    break
                                }
                                if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood[chat.id]]){
                                    console.log('еду не нашли ' + i)
                                    bot.sendMessage(chat.id, temp_food_text[chat.id], {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard: inline_kb
                                        }
                                    })
                                }
                            }
                            if (basket[chat.id].length === 0){
                                console.log('корзина пустая')
                                    bot.sendMessage(chat.id, temp_food_text[chat.id], {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard: inline_kb
                                        }
                                    })
                            }
                        }).catch(err => {
                            temp_food_text[chat.id] = `<b>` + userFoodlist[chat.id][userFood[chat.id]] + `</b>
` + food_description + `

<b> 💰 Цена: </b>` + temp_food_price[chat.id] + ` тенге`

let inline_kb
                            if (snapshot.val().is_active !== true){
                                temp_food_text[chat.id] += `

❗️ Этот товар пока что недоступен 🥺`
                                inline_kb = [
                                    [{
                                        text: anotherfood_text,
                                        callback_data: anotherfood_text
                                    }]
                                ]
                            }

                            if (snapshot.val().is_active === true){
                                inline_kb = [
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
                                                        for (let i = 0; i < basket[chat.id].length; i++){
                                                            if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood[chat.id]]){
                                                                console.log('foundfood ' + i)
                                                                inline_kb[0] =
                                                                [{
                                                                    text: changefoodamount_basket_text /* changefoodamount_basket_text */,
                                                                    callback_data: changefoodamount_basket_text
                                                                }]
                                                                bot.sendMessage(chat.id, temp_food_text[chat.id], {
                                                                    parse_mode: 'HTML',
                                                                    reply_markup:{
                                                                        inline_keyboard: inline_kb
                                                                    }
                                                                })
                                                                break
                                                            }
                                                            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood[chat.id]]){
                                                                console.log('еду не нашли ' + i)
                                                                bot.sendMessage(chat.id, temp_food_text[chat.id], {
                                                                    parse_mode: 'HTML',
                                                                    reply_markup:{
                                                                        inline_keyboard: inline_kb
                                                                    }
                                                                })
                                                            }
                                                        }
                                                        if (basket[chat.id].length === 0){
                                                            console.log('корзина пустая')
                                                                bot.sendMessage(chat.id, temp_food_text[chat.id], {
                                                                    parse_mode: 'HTML',
                                                                    reply_markup:{
                                                                        inline_keyboard: inline_kb
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
        userCategory[chat.id] = ''
        bot.deleteMessage(chat.id, message_id)
        keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id], message_toedit[chat.id], message_text[chat.id])
    }
    if (query.data === anotherfood_text){
        userFood[chat.id] = ''
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
        keyboards.FoodKeyboard(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, choosefood_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id])

    }
    if (query.data === anotherfood_text2[1]){
        bot.deleteMessage(chatId, message_toedit[chatId][2])
        /* bot.editMessageText(choosefood_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id, //!!!! НЕ ТОТ МЕССЕДЖ ID УДАЛЯЕМ
                reply_markup:{
                    inline_keyboard:foodlist_keyboard[chat.id]
                }
            }) */
            userFood[chat.id] = ''
            keyboards.FoodKeyboard(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, choosefood_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id])

        //bot.deleteMessage(chat.id, message_id - 1)
    }
    if (query.data === addto_basket_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }) //убираем клаву в описании блюда
        for (let i = 0; i < basket[chat.id].length; i++){
            console.log('!!!! ' + basket[chat.id][i][0] + ' ' + userFoodlist[chat.id][userFood[chat.id]])
            if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood[chat.id]]){

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
            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood[chat.id]]){
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
                console.log('226 ' + basket[chat.id][i][0] + ' ' + userFoodlist[chat.id][userFood[chat.id]])
                if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood[chat.id]]){
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
                if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood[chat.id]]){
                    console.log('227 ' + basket[chat.id][i][0] + ' ' + userFoodlist[chat.id][userFood[chat.id]])
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
                if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood[chat.id]]){
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
            if (basket[chat.id][temp_backet_food[chat.id]][1] > 1){
                console.log('Уменьшаем: ' + basket[chat.id][temp_backet_food[chat.id]][0])
                basket[chat.id][temp_backet_food[chat.id]][1]--
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
    }
    if (query.data === dont_addto_basket_text2){
        for (let i = 0; i < basket[chat.id].length; i++){
            if (userFoodlist[chat.id][userFood[chat.id]] === basket[chat.id][i][0]){
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
        console.log('!!!!!!!! ' + userFoodlist[chat.id] + '   ' + userFoodlist[chat.id][userFood[chat.id]])
        for (let i = 0; i < basket[chat.id].length; i++){
            console.log('0.1')
            if (basket[chat.id][i][0] === userFoodlist[chat.id][userFood[chat.id]]){
                console.log('1')
              //  let newfood = [userFoodlist[chat.id][userFood[chat.id]], temp_foodamount[chat.id], temp_food_price[chat.id]]
             //   basket[chat.id][i] = newfood
                bot.deleteMessage(chat.id, message_id).catch(err => {console.log('! ' + err)})
                bot.deleteMessage(chat.id, message_id - 1).catch(err => {console.log('! ' + err)})
                bot.deleteMessage(chat.id, message_id - 2).catch(err => {console.log('! ' + err)})
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    for (let i = 0; i < basket[chat.id].length; i++){
                        finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                        if (i === basket[chat.id].length - 1){
                            if (coupondata[chat.id] !== undefined){
                                editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                                finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                                console.log('1finalsum: ' +finalsum)
                                if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                    editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                }
                            }
                            else if (coupondata[chat.id] === undefined){
                                editmsg += finalsum + 'тг.'
                                if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                    editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                }
                            }
                            console.log(finalsum + ' ' + i)
                            finalprice[chat.id] = finalsum + delivery_price[chat.id]
                            console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)

                            for (let i = 0; i < basket[chat.id].length; i++){
                                console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                                editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                                if (i === basket[chat.id].length - 1){
                                    console.log('2Блюдо: ')
                                    bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
                                    }).then(res => {
                                        console.log('ОТПРАВИЛИ СООБЩЕНИЕ')
                                        message_toedit[chat.id][2] = res.message_id
                                        bot.sendMessage(chat.id,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2[0],
                                                        callback_data: anotherfood_text2[1]
                                                    },
                                                    {
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }],
                                                    [{
                                                        text: writecoupon[0],
                                                        callback_data: writecoupon[1]
                                                    }],
                                                    [{
                                                        text: paybasket_text[0],
                                                        callback_data: paybasket_text[1]
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
                break
            }
            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userFoodlist[chat.id][userFood[chat.id]]) {
                console.log(userFoodlist[chat.id][userFood[chat.id]] + ' ' + temp_foodamount[chat.id] + ' ' + temp_food_price[chat.id])
                let newfood = [userFoodlist[chat.id][userFood[chat.id]], temp_foodamount[chat.id], temp_food_price[chat.id], userCategory[chat.id]]
                basket[chat.id].push(newfood)
                temp_foodamount[chat.id] = 1
                bot.deleteMessage(chat.id, message_id).catch(err => {console.log('! ' + err)})
                bot.deleteMessage(chat.id, message_id - 1).catch(err => {console.log('! ' + err)})
                bot.deleteMessage(chat.id, message_id - 2).catch(err => {console.log('! ' + err)})
                    let editmsg = `Ваш заказ: `
                    let finalsum = 0
                    
                    for (let i = 0; i < basket[chat.id].length; i++){
                        finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                        if (i === basket[chat.id].length - 1){
                            if (coupondata[chat.id] !== undefined){
                                editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                                finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                                console.log('1finalsum: ' +finalsum)
                                if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                    editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                }
                            }
                            else if (coupondata[chat.id] === undefined){
                                editmsg += finalsum + 'тг.'
                                if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                    editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                }
                            }
                            //console.log(finalsum + ' ' + i)
                            finalprice[chat.id] = finalsum + delivery_price[chat.id]
                            console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)
                            for (let i = 0; i < basket[chat.id].length; i++){
                                //console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
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
                                        }).then(res => {
                                            message_toedit[chat.id][2] = res.message_id
                                            bot.sendMessage(chat.id,  editmsg , {
                                                reply_markup:{
                                                    inline_keyboard: [
                                                        [{
                                                            text: anotherfood_text2[0],
                                                            callback_data: anotherfood_text2[1]
                                                        },
                                                        {
                                                            text: editbasket_text,
                                                            callback_data: editbasket_text
                                                        }],
                                                        [{
                                                            text: writecoupon[0],
                                                            callback_data: writecoupon[1]
                                                        }],
                                                        [{
                                                            text: paybasket_text[0],
                                                            callback_data: paybasket_text[1]
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
                                        }).then(res => {
                                            message_toedit[chat.id][2] = res.message_id
                                            bot.sendMessage(chat.id,  editmsg , {
                                                reply_markup:{
                                                    inline_keyboard: [
                                                        [{
                                                            text: anotherfood_text2[0],
                                                            callback_data: anotherfood_text2[1]
                                                        },
                                                        {
                                                            text: editbasket_text,
                                                            callback_data: editbasket_text
                                                        }],
                                                        [{
                                                            text: writecoupon[0],
                                                            callback_data: writecoupon[1]
                                                        }],
                                                        [{
                                                            text: paybasket_text[0],
                                                            callback_data: paybasket_text[1]
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
                
                break
            }
        }
        if (basket[chat.id].length === 0){
            console.log('3')
            let newfood = [userFoodlist[chat.id][userFood[chat.id]], temp_foodamount[chat.id], temp_food_price[chat.id], userCategory[chat.id]]
            basket[chat.id].push(newfood)
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('! ' + err)})
            bot.deleteMessage(chat.id, message_id - 1).catch(err => {console.log('! ' + err)})
            bot.deleteMessage(chat.id, message_id - 2).catch(err => {console.log('! ' + err)})
                let editmsg = `Ваш заказ: `
                let finalsum = 0 
                    for (let i = 0; i < basket[chat.id].length; i++){
                        finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                        if (coupondata[chat.id] !== undefined){
                            editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                            finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                            console.log('1finalsum: ' +finalsum)
                            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                            }
                        }
                        else if (coupondata[chat.id] === undefined){
                            editmsg += finalsum + 'тг.'
                            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                            }
                        }
                        finalprice[chat.id] = finalsum + delivery_price[chat.id]
                        console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)

                        for (let i = 0; i < basket[chat.id].length; i++){
                            console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                            editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                            if (i === basket[chat.id].length - 1){
                                console.log('2Блюдо: userstatus[chat.id]: ' + userstatus[chat.id] + ', ' + chat.id)
                                if (userstatus[chat.id] === 'registered'){
                                    bot.sendMessage(chat.id, `<b>`+ newfood[0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
/*                                         reply_markup: {
                                            keyboard: registered_keyboard[0],
                                            resize_keyboard: true
            
                                        } */
                                    }).then(res => {
                                        message_toedit[chat.id][2] = res.message_id
                                        bot.sendMessage(chat.id,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2[0],
                                                        callback_data: anotherfood_text2[1]
                                                    },
                                                    {
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }],
                                                    [{
                                                        text: writecoupon[0],
                                                        callback_data: writecoupon[1]
                                                    }],
                                                    [{
                                                        text: paybasket_text[0],
                                                        callback_data: paybasket_text[1]
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
/*                                         reply_markup: {
                                            keyboard: unregistered_keyboard[0],
                                            resize_keyboard: true
            
                                        } */
                                    }).then(res => {     
                                        message_toedit[chat.id][2] = res.message_id     
                                        bot.sendMessage(chat.id,  editmsg , {
                                            parse_mode:'HTML',
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2[0],
                                                        callback_data: anotherfood_text2[1]
                                                    },
                                                    {
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }],
                                                    [{
                                                        text: writecoupon[0],
                                                        callback_data: writecoupon[1]
                                                    }],
                                                    [{
                                                        text: paybasket_text[0],
                                                        callback_data: paybasket_text[1]
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
    if (query.data === editbasket_text){
        bot.deleteMessage(chatId, message_toedit[chatId][2])
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }).then(() => {
            let keyboard = []
            let line_amount = 1 + Math.floor(basket[chat.id].length / 4)
            let lastbuttons_amount = basket[chat.id].length - ((line_amount - 1) * 4)
            console.log('4-х клавишных рядом в клавиатуре: ' + line_amount + '. Кнопок в последнем ряду ( <4 клавиш ): ' + lastbuttons_amount)
            keyboard[0] = [{
                text: anotherfood_text2[0],
                callback_data: anotherfood_text2[1]
            }]
            for (let i = 1; i < line_amount; i++){
                console.log('Создаем клавиатуру с рядами по 4 кнопки: ' + i)
                keyboard[i] = [{
                    text: i,
                    callback_data: i.toString() + '_editbasketcb'
                },
                {
                    text: i+1,
                    callback_data: (i + 1).toString()  + '_editbasketcb'
                },
                {
                    text: i+2,
                    callback_data: (i + 2).toString()  + '_editbasketcb'
                },
                {
                    text: i+3,
                    callback_data: (i + 3).toString()  + '_editbasketcb'
                }]
                if (i === line_amount - 1 && lastbuttons_amount !== 0){
                    console.log('Закончили создавать 4-х клавишные ряды. Создаем последний ряд')
                    keyboard[line_amount] = []
                    for (let b = 1; b < lastbuttons_amount + 1; b++){
                        console.log('b = ' + b + '. lastbuttons_amount = ' + lastbuttons_amount)
                        if (line_amount > 1){
                            keyboard[line_amount].push({
                                text: (4 + b).toString(),
                                callback_data: (4 + b).toString() + '_editbasketcb'
                            })
                        }
                        if (line_amount <= 1){
                            keyboard[line_amount].push({
                                text: b.toString(),
                                callback_data: b.toString()  + '_editbasketcb'
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
                                callback_data: (4 + b).toString()  + '_editbasketcb'
                            })
                        }
                        if (line_amount <= 1) {
                            keyboard[1].push({
                                text: b.toString() ,
                                callback_data: b.toString()  + '_editbasketcb'
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
        if (userCategory[chat.id] !== '' && userCategory[chat.id] !== 'unknown'){
            if (query.data === (i+1).toString() + '_editbasketcb'){
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
        bot.deleteMessage(chat.id, message_id).catch(err => {console.log('! ' + err)})
            if (basket[chat.id].length > 0){
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chat.id].length; i++){
                    finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                    if (i === basket[chat.id].length - 1){
                        if (coupondata[chat.id] !== undefined){
                            editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                            finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                            console.log('1finalsum: ' +finalsum)
                            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                            }
                        }
                        else if (coupondata[chat.id] === undefined){
                            editmsg += finalsum + 'тг.'
                            if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                            }
                        }
                        console.log(finalsum + ' ' + i)
                        finalprice[chat.id] = finalsum + delivery_price[chat.id]
                        console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)
                        for (let i = 0; i < basket[chat.id].length; i++){
                            console.log('1Блюдо: ' + basket[chat.id][i][0] + '. Цена: ' + basket[chat.id][i][2] + ' х ' + basket[chat.id][i][1] + ' = ' + (basket[chat.id][i][1] * basket[chat.id][i][2]))
                            editmsg += `
` + (i+1) + `. ` + basket[chat.id][i][0] + `. Цена: ` + basket[chat.id][i][2] + `тг. х ` + basket[chat.id][i][1] + ` = ` + (basket[chat.id][i][1] * basket[chat.id][i][2]) + `тг.`
                            if (i === basket[chat.id].length - 1){
                                console.log('2Блюдо: ')
                                if (userstatus[chat.id] === 'registered'){
                                    bot.sendMessage(chat.id, `<b>`+ basket[chat.id][i][0] + `</b> добавлен в корзину`, {
                                        parse_mode: 'HTML',
/*                                         reply_markup: {
                                            keyboard: registered_keyboard[0],
                                            resize_keyboard: true
        
                                        } */
                                    }).then(res => {
                                        message_toedit[chat.id][2] = res.message_id
                                        bot.sendMessage(chat.id,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2[0],
                                                        callback_data: anotherfood_text2[1]
                                                    },
                                                    {
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }],
                                                    [{
                                                        text: writecoupon[0],
                                                        callback_data: writecoupon[1]
                                                    }],
                                                    [{
                                                        text: paybasket_text[0],
                                                        callback_data: paybasket_text[1]
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
/*                                         reply_markup: {
                                            keyboard: unregistered_keyboard[0],
                                            resize_keyboard: true
        
                                        } */
                                    }).then(res => {
                                        message_toedit[chat.id][2] = res.message_id
                                        bot.sendMessage(chat.id,  editmsg , {
                                            reply_markup:{
                                                inline_keyboard: [
                                                    [{
                                                        text: anotherfood_text2[0],
                                                        callback_data: anotherfood_text2[1]
                                                    },
                                                    {
                                                        text: editbasket_text,
                                                        callback_data: editbasket_text
                                                    }],
                                                    [{
                                                        text: writecoupon[0],
                                                        callback_data: writecoupon[1]
                                                    }],
                                                    [{
                                                        text: paybasket_text[0],
                                                        callback_data: paybasket_text[1]
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
                                text: anotherfood_text2[0],
                                callback_data: anotherfood_text2[1]
                            }],
                        ]
                    }
                }).then(()=>{
                    buttons_message[chat.id] = query.message.message_id
                    console.log('& ' + buttons_message[chat.id])
                })
            }

    }
    if (query.data === addto_basket_text3) {
        bot.deleteMessage(chat.id, message_id).catch(err => {console.log('! ' + err)})
            let editmsg = `Ваш заказ: `
            let finalsum = 0
            for (let i = 0; i < basket[chat.id].length; i++){
                finalsum += (basket[chat.id][i][2] * basket[chat.id][i][1])
                if (i === basket[chat.id].length - 1){
                    if (coupondata[chat.id] !== undefined){
                        editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                        finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                        console.log('1finalsum: ' +finalsum)
                        if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                            editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                        }
                    }
                    else if (coupondata[chat.id] === undefined){
                        editmsg += finalsum + 'тг.'
                        if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                            editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                        }
                    }
                    finalprice[chat.id] = finalsum + delivery_price[chat.id]
                    console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)
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
/*                                     reply_markup: {
                                        keyboard: unregistered_keyboard[0],
                                        resize_keyboard: true
    
                                    } */
                                }).then(res => {
                                    message_toedit[chat.id][2] = res.message_id
                                    bot.sendMessage(chat.id,  editmsg , {
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: anotherfood_text2[0],
                                                    callback_data: anotherfood_text2[1]
                                                },
                                                {
                                                    text: editbasket_text,
                                                    callback_data: editbasket_text
                                                }],
                                                [{
                                                    text: writecoupon[0],
                                                    callback_data: writecoupon[1]
                                                }],
                                                [{
                                                    text: paybasket_text[0],
                                                    callback_data: paybasket_text[1]
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
/*                                     reply_markup: {
                                        keyboard: registered_keyboard[0],
                                        resize_keyboard: true
    
                                    } */
                                }).then(res => {
                                    message_toedit[chat.id][2] = res.message_id
                                    bot.sendMessage(chat.id,  editmsg , {
                                        reply_markup:{
                                            inline_keyboard: [
                                                [{
                                                    text: anotherfood_text2[0],
                                                    callback_data: anotherfood_text2[1]
                                                },
                                                {
                                                    text: editbasket_text,
                                                    callback_data: editbasket_text
                                                }],
                                                [{
                                                    text: writecoupon[0],
                                                    callback_data: writecoupon[1]
                                                }],
                                                [{
                                                    text: paybasket_text[0],
                                                    callback_data: paybasket_text[1]
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
    if (query.data === backtoaskinfo[1]){
        isMakingChanges[chat.id] = 0
        if (user_name[chat.id] !== '' && user_phone[chat.id] !== '' && user_adress[chat.id] !== ''){
            bot.editMessageText(message_text[chat.id][1], {
                parse_mode: 'HTML',
                chat_id: chat.id, 
                message_id: message_toedit[chat.id][1],
                reply_markup: {
                    inline_keyboard:[
                        [{
                            text: 'Имя: ' + user_name[chat.id],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chat.id],
                            callback_data: changephone_text
                        }],
                        [{
                            text: 'Адрес: ' + user_adress[chat.id],
                            callback_data: changeadress_text
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect_text
                        }]
                    ]
                }
            })
        }
        else {
            bot.editMessageText(message_text[chat.id][1], {
                parse_mode: 'HTML',
                chat_id: chat.id, 
                message_id: message_toedit[chat.id][1],
                reply_markup: {
                    inline_keyboard:[
                        [{
                            text: 'Имя: ' + user_name[chat.id],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chat.id],
                            callback_data: changephone_text
                        }],
                        [{
                            text: 'Адрес: ' + user_adress[chat.id],
                            callback_data: changeadress_text
                        }]
                    ]
                }
            })
        }
    }
    if (query.data === changename_text){
        isMakingChanges[chat.id] = 1
        bot.editMessageText('🙂 Введите свое имя, так курьеру будет проще найти Вас:', {
            parse_mode: 'HTML',
            chat_id: chat.id, 
            message_id: message_toedit[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtoaskinfo[0],
                        callback_data: backtoaskinfo[1]
                    }]
                ]
            }
        })
    }
    if (query.data === changephone_text){
        isMakingChanges[chat.id] = 2
        bot.deleteMessage(chat.id, message_toedit[chat.id][1])
        bot.sendPhoto(chat.id, openkeyboard_pic, {
            parse_mode: 'HTML',
            caption: 'Нажмите на кнопку <b>"📞 Отправить номер"</b> снизу, чтобы прикрепить свой номер. Если вы не видите кнопку, нажмите на значок справа от клавиатуры',
            reply_markup: {
                keyboard: [
                    [{
                        text: '📞 Отправить номер',
                        request_contact: true
                    }],
                    [{
                        text: '◀️ Назад'
                    }]
                ],
                resize_keyboard: true
            }
        }).then(res => {
            message_toedit[chat.id][1] = res.message_id
            message_text[chat.id][1] = res.caption
        })
    }
    if (query.data === changeadress_text){
        isMakingChanges[chat.id] = 3
        bot.editMessageText('📍 Введите адрес доставки в формате Улица, Дом, Квартира, Этаж:', {
            parse_mode: 'HTML',
            chat_id: chat.id, 
            message_id: message_toedit[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtoaskinfo[0],
                        callback_data: backtoaskinfo[1]
                    }]
                ]
            }
        })
    }
    if (query.data === changeamountof_persons){
        isMakingChanges_2[chat.id] = 1
        bot.editMessageText('👥 Введите количество персон: ', {
            chat_id: chat.id, 
            message_id: message_toedit[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtodopblank[0],
                        callback_data: backtodopblank[1]
                    }]
                ]
            }
        })
    }
    if (query.data === changepaying_method){
        //isMakingChanges_2[chat.id] = 2
        let kb = []
        if (point_payment_options[chatId][1] === true){
            kb.push([{
                text: 'Наличными курьеру',
                callback_data: 'Наличными курьеру'
            }])
        }

        if (point_payment_options[chatId][0] === true){
            kb.push([{
                text: 'Безналичными курьеру',
                callback_data:'Безналичными курьеру'
            }])
        }
        bot.editMessageText('💳 Выберите способ оплаты', {
            chat_id: chat.id, 
            message_id: message_toedit[chat.id][1],
            reply_markup:{
                inline_keyboard: kb
            }
        })
    }
    if (query.data === /* user_payingmethod[chat.id] +  */'Наличными курьеру' || query.data === /* user_payingmethod[chat.id] + */ 'Безналичными курьеру'){
        if (query.data === /* user_payingmethod[chat.id] + */ 'Наличными курьеру'){
            user_payingmethod[chat.id] = 'Наличными курьеру'

            if (point_pplamount[chat.id] !== false){
                bot.editMessageText(dopblank_text, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][1],
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: '💵: ' + user_payingmethod[chat.id],
                                callback_data: changepaying_method
                            }],
                            [{
                                text: '👥: ' + user_personsamount[chat.id],
                                callback_data: changeamountof_persons
                            },
                            {
                                text: '🕒: ' + user_deliverdate[chat.id],
                                callback_data: changedeliver_date
                            }],
                            [{
                                text: backtoaskinfo[0],
                                callback_data: backtoaskinfo[1]
                            },
                            {
                                text: dataiscorrect_text,
                                callback_data: dataiscorrect2_text
                            }]
                        ]
                    }
                }).then(res => {
                    message_text[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                    //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
                })
            }
            
            if (point_pplamount[chat.id] === false){
                bot.editMessageText(dopblank_text, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][1],
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: '🕒: ' + user_deliverdate[chat.id],
                                callback_data: changedeliver_date
                            },
                            {
                                text: '💵: ' + user_payingmethod[chat.id],
                                callback_data: changepaying_method
                            }],
                            [{
                                text: backtoaskinfo[0],
                                callback_data: backtoaskinfo[1]
                            },
                            {
                                text: dataiscorrect_text,
                                callback_data: dataiscorrect2_text
                            }]
                        ]
                    }
                }).then(res => {
                    message_text[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                    //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
                })
            }
        }

        else if (query.data === /* user_payingmethod[chat.id] + */ 'Безналичными курьеру'){
            user_payingmethod[chat.id] = 'Безналичными курьеру'

            if (point_pplamount[chat.id] !== false){
                bot.editMessageText(dopblank_text, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][1],
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: '💵: ' + user_payingmethod[chat.id],
                                callback_data: changepaying_method
                            }],
                            [{
                                text: '👥: ' + user_personsamount[chat.id],
                                callback_data: changeamountof_persons
                            },
                            {
                                text: '🕒: ' + user_deliverdate[chat.id],
                                callback_data: changedeliver_date
                            }],
                            [{
                                text: backtoaskinfo[0],
                                callback_data: backtoaskinfo[1]
                            },
                            {
                                text: dataiscorrect_text,
                                callback_data: dataiscorrect2_text
                            }]
                        ]
                    }
                }).then(res => {
                    message_text[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                    //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
                })
            }
            
            if (point_pplamount[chat.id] === false){
                bot.editMessageText(dopblank_text, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][1],
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: '🕒: ' + user_deliverdate[chat.id],
                                callback_data: changedeliver_date
                            },
                            {
                                text: '💵: ' + user_payingmethod[chat.id],
                                callback_data: changepaying_method
                            }],
                            [{
                                text: backtoaskinfo[0],
                                callback_data: backtoaskinfo[1]
                            },
                            {
                                text: dataiscorrect_text,
                                callback_data: dataiscorrect2_text
                            }]
                        ]
                    }
                }).then(res => {
                    message_text[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                    //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
                })
            }
        }
    }
    if (query.data === backtodopblank[1]){
        isMakingChanges_2[chat.id] = 0
        if (point_pplamount[chat.id] !== false){
            bot.editMessageText(dopblank_text, {
                chat_id: chat.id,
                message_id: message_toedit[chat.id][1],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: '💵: ' + user_payingmethod[chat.id],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: '👥: ' + user_personsamount[chat.id],
                            callback_data: changeamountof_persons
                        },
                        {
                            text: '🕒: ' + user_deliverdate[chat.id],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: backtoaskinfo[0],
                            callback_data: backtoaskinfo[1]
                        },
                        {
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            }).then(res => {
                message_text[chat.id][1] = res.text
                message_toedit[chat.id][1] = res.message_id
                //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
            })
        }
        
        if (point_pplamount[chat.id] === false){
            bot.editMessageText(dopblank_text, {
                chat_id: chat.id,
                message_id: message_toedit[chat.id][1],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: '🕒: ' + user_deliverdate[chat.id],
                            callback_data: changedeliver_date
                        },
                        {
                            text: '💵: ' + user_payingmethod[chat.id],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: backtoaskinfo[0],
                            callback_data: backtoaskinfo[1]
                        },
                        {
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            }).then(res => {
                message_text[chat.id][1] = res.text
                message_toedit[chat.id][1] = res.message_id
                //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
            })
        }
    }
    if (query.data === changedeliver_date){
        isMakingChanges_2[chat.id] = 2
        bot.editMessageText('⏰ Укажите, когда вам нужно доставить заказ: ', {
            chat_id: chat.id, 
            message_id: message_toedit[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtodopblank[0],
                        callback_data: backtodopblank[1]
                    }]
                ]
            }
        })
    }
    if (query.data === dataiscorrect_text){
        if (point_pplamount[chat.id] !== false){
            bot.editMessageText(dopblank_text, {
                chat_id: chat.id,
                message_id: message_toedit[chat.id][1],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: '💵: ' + user_payingmethod[chat.id],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: '👥: ' + user_personsamount[chat.id],
                            callback_data: changeamountof_persons
                        },
                        {
                            text: '🕒: ' + user_deliverdate[chat.id],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: backtoaskinfo[0],
                            callback_data: backtoaskinfo[1]
                        },
                        {
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            }).then(res => {
                message_text[chat.id][1] = res.text
                message_toedit[chat.id][1] = res.message_id
                //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
            })
        }
        
        if (point_pplamount[chat.id] === false){
            bot.editMessageText(dopblank_text, {
                chat_id: chat.id,
                message_id: message_toedit[chat.id][1],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: '🕒: ' + user_deliverdate[chat.id],
                            callback_data: changedeliver_date
                        },
                        {
                            text: '💵: ' + user_payingmethod[chat.id],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: backtoaskinfo[0],
                            callback_data: backtoaskinfo[1]
                        },
                        {
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            }).then(res => {
                message_text[chat.id][1] = res.text
                message_toedit[chat.id][1] = res.message_id
                //console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
            })
        }
    }
    if (query.data === dataiscorrect2_text){
        if (user_payingmethod[chat.id] === 'Наличными курьеру'){
            isMakingChanges_2[chat.id] = 3
            bot.editMessageText('Напишите, с какой суммы вы хотите получить сдачу: ', {
                chat_id: chat.id, 
                message_id: message_toedit[chat.id][1],
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
                message_id: message_toedit[chat.id][1],
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
            message_id: message_toedit[chat.id][1],
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
            skidka[chat.id] = 0
            bot.deleteMessage(chat.id, message_toedit[chat.id][1])
            .then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        inline_keyboard: unregistered_keyboard[3],
                    }
                }).then(res => {
                    message_toedit[chat.id][5] = res.message_id
                    message_text[chat.id][5] = res.text
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
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/adress'] = user_adress[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_price'] = average_price[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/email'] = user_email[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/favourite_food'] = favourite_food[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/id'] = chat.id
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/name'] = user_name[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/phone'] = user_phone[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/username'] = username[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]

                updates['Motherbase/clients/' + chat.id + '/adress'] = user_adress[chat.id]

                updates['Motherbase/clients/' + chat.id + '/food/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/favourite_food'] = favourite_food[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/average_price'] = average_price[chat.id]

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))

                order_name[chat.id] = 'Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/bills/' + time_now.getTime()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = (time_now.getTime()).toString()

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()

                updates[order_name[chat.id] + '/date_ordered'] = time_now.getTime()
                updates[order_name[chat.id] + '/order_info'] = finalbasket[chat.id]
                updates[order_name[chat.id] + '/price'] = finalprice[chat.id],
                updates[order_name[chat.id] + '/client_id'] = chat.id
                updates[order_name[chat.id] + '/phone'] = user_phone[chat.id]
                updates[order_name[chat.id] + '/order_status'] = order_statuses_text[0]
                updates[order_name[chat.id] + '/adress'] = user_adress[chat.id]
                updates[order_name[chat.id] + '/client_name'] = user_name[chat.id]
                updates[order_name[chat.id] + '/user_payingmethod'] =user_payingmethod[chat.id]
                updates[order_name[chat.id] + '/user_deliverdate'] = user_deliverdate[chat.id]
                updates[order_name[chat.id] + '/user_sdachainfo'] = user_sdachainfo[chat.id]
                updates[order_name[chat.id] + '/user_howtocome'] = user_howtocome[chat.id]

                if (point_pplamount[chat.id] !== false){
                    updates[order_name[chat.id] + '/user_personsamount'] = user_personsamount[chat.id]
                }

                if (userstatus[chat.id] === 'unregistered'){
                    userstatus[chat.id] = 'registered'
                }
                
                fb.database().ref().update(updates)

                AddMailingData(chat.id)
                StartCheckingOrder(chat.id)

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = time_now.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = time_now.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + time_now.getDate() + '.' + (time_now.getMonth() + 1)

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

if (coupondata[chat.id] !== undefined){
    deliver_bill_finalprice += `Использован купон ` + coupondata[chat.id][0] + `. Скидка ` + coupondata[chat.id][1] + `% учтена в итоговой стоимости

`
}

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>`
    if (point_pplamount[chat.id] !== false){
        deliver_bill_help_info += `
├ Кол-во персон: ` + user_personsamount[chat.id]
    }
    deliver_bill_help_info += `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    console.log('delivery_chat: ' + delivery_chat[chat.id])
    bot.sendMessage(delivery_chat[chat.id], delivers_bill, {
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
    })

            })
        }
        else {
            //bot.deleteMessage(chat.id, message_toedit[chat.id][1])
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).then(() => {
                order_status[chat.id] = order_statuses_text[0]
                bot.sendMessage(chat.id, delivery_started, {
                    reply_markup: {
                        inline_keyboard: unregistered_keyboard[3],
                    }
                }).then(res => {
                    message_toedit[chat.id][5] = res.message_id
                    message_text[chat.id][5] = res.text
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
                
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/adress'] = user_adress[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_price'] = average_price[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/email'] = user_email[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/favourite_food'] = favourite_food[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/id'] = chat.id
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/name'] = user_name[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/phone'] = user_phone[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/username'] = username[chat.id]
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
               
                updates['Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/clients/'  + chat.id + '/average_purchases'] = average_purchases[chat.id]

                updates['Motherbase/clients/' + chat.id + '/adress'] = user_adress[chat.id]

                updates['Motherbase/clients/' + chat.id + '/food/alltime_purchases_amount'] = alltime_purchases_amount[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/favourite_food'] = favourite_food[chat.id]
                updates['Motherbase/clients/' + chat.id + '/food/average_price'] = average_price[chat.id]

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chat.id] = 'Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/bills/' + time_now.getTime()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = (time_now.getTime()).toString()

                updates[order_name[chat.id] + '/date_ordered'] = time_now.getTime()
                updates[order_name[chat.id] + '/order_info'] = finalbasket[chat.id]
                updates[order_name[chat.id] + '/price'] = finalprice[chat.id],
                updates[order_name[chat.id] + '/client_id'] = chat.id
                updates[order_name[chat.id] + '/phone'] = user_phone[chat.id]
                updates[order_name[chat.id] + '/order_status'] = order_statuses_text[0]
                updates[order_name[chat.id] + '/adress'] = user_adress[chat.id]
                updates[order_name[chat.id] + '/client_name'] = user_name[chat.id]
                updates[order_name[chat.id] + '/user_payingmethod'] =user_payingmethod[chat.id]
                updates[order_name[chat.id] + '/user_deliverdate'] = user_deliverdate[chat.id]
                updates[order_name[chat.id] + '/user_sdachainfo'] = user_sdachainfo[chat.id]
                updates[order_name[chat.id] + '/user_howtocome'] = user_howtocome[chat.id]


                if (point_pplamount[chat.id] !== false){
                    updates[order_name[chat.id] + '/user_personsamount'] = user_personsamount[chat.id]
                }

                if (userstatus[chat.id] === 'unregistered'){
                    userstatus[chat.id] = 'registered'
                }

                fb.database().ref().update(updates)

                AddMailingData(chat.id)
                StartCheckingOrder(chat.id)

                if (coupondata[chat.id] !== undefined) {
                    let point_info4 = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients')
                    point_info4.get().then((csnap) => {
                        if (csnap.exists()){
                            let upd = {}
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activ_left'] = csnap.val().activ_left - 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/activated'] = csnap.val().activated + 1
                            upd['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupondata[chat.id][0] + '/clients'] = csnap.val().clients + ',' + chat.id    
                            fb.database().ref().update(upd)
                        }
                        
                    })
                }

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = time_now.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = time_now.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + time_now.getDate() + '.' + (time_now.getMonth() + 1)
    
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

if (coupondata[chat.id] !== undefined){
    deliver_bill_finalprice += `Использован купон ` + coupondata[chat.id][0] + `. Скидка ` + coupondata[chat.id][1] + `% учтена в итоговой стоимости

`
}

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b>
└ Дата заказа: ` + visible_date + `

`

deliver_bill_help_info = `<b>📌 Доп. информация</b>`
    if (point_pplamount[chat.id] !== false){
        deliver_bill_help_info += `
├ Кол-во персон: ` + user_personsamount[chat.id]
    }
    deliver_bill_help_info += `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])

    delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    bot.sendMessage(delivery_chat[chat.id], delivers_bill, {
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
    })
    
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
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
        updates['Basement/clients/' + chat.id + '/coins'] = user_coins[chat.id]
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
                keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id], message_toedit[chat.id], message_text[chat.id])
            })
        })
    }  
    if (query.data === dontleavecomment){
        let orderinfo = fb.database().ref(order_name[chat.id]);
        orderinfo.get().then((snapshot) => 
        {
            console.log('saving poll...')
            let updates = {}
/*             let bill_update = {
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
            } */
            updates[order_name[chat.id] + '/feedback'] = feedback_options[answered_feedback[chat.id]]
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('hr: ' + err)})
            fb.database().ref().update(updates).then(() => {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, query.message.message_id - i).catch(err => {
                        //console.log(err)
                    })
                }

                let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
└ Оценка клиента: ` + feedback_options[answered_feedback[chat.id]]
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: delivery_chat[chat.id],
                        message_id: snapshot.val().message_id
                    })
                bot.sendSticker(chat.id, sticker_hello).then(() => {
                   /*  Reset(chat.id)
                    anotherpoint_multiple[chat.id] = 2 */
                    //keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chat.id], userPoint[chat.id], user_mode[chat.id])
                    bot.sendMessage(chatId, 'Мы рады, что Вы пользуетесь Resify. Закажем что-нибудь еще?').then(() => {
                        //Reset(chatId)
                        anotherpoint_multiple[chatId] = 2
                        userPoint[chat.id] = 0
                        userCategory[chat.id] = ''
                        userFood[chat.id] = ''
                        userFoodlist[chat.id] = []
                        order_name[chatId] = 0
                        coupondata[chat.id] = undefined
                        basket[chat.id] = []
                        finalprice[chatId] = 0
                        finalbasket[chatId] = ''
                        temp_backet_food[chatId] = 0
                        temp_food_text[chatId] = ''
                        temp_food_price[chatId] = 0
                        temp_foodamount[chatId] = 1
                        skidka[chatId] = 0
                        keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], UserDelCat[chat.id], fb, bot, chat.id, change_delcat_text, choosepoint_text, user_mode[chat.id], sendlocation, message_toedit[chat.id], message_text[chat.id])
                        //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, UserDelCat[chatId], userPoint[chatId], user_mode[chatId], message_toedit[chat.id], message_text[chat.id])
                    })
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
    if (query.data === openadminpanel[1]){
        
        let cbadmin_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id])
    cbadmin_data.get().then((result) => {
        if (result.val().chats !== undefined){
            if (result.val().chats.admin === chat.id){
                isMailingMessage[chat.id] = 0
                //isChangingPrefs[chat.id] = 0
                isChangingPhone[chat.id] = 0
                isChangingTime[chat.id] = 0
                isChangingDelivery[chat.id] = 0
                isCreatingCoupon[chat.id] = 0
                mailing_text[chat.id] = ''

                isAdmin[chat.id] = true
                //message_text[chat.id] = []
                //message_toedit[chat.id] = []
    
                point_rating[chat.id] = result.val().other_info.stats.rating
                point_delivery_time[chat.id] = result.val().other_info.stats.delivery_time
    
                let rating
                if (point_rating[chat.id] < 1){
                    rating = feedback_options[0] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                }
    
                if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                    rating = feedback_options[1] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                }
    
                if (point_rating[chat.id] > 2){
                    rating = feedback_options[2] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                }
    
                let ttd_ms = result.val().other_info.stats.delivery_time
                let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
    
                ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
    
                let ttd 
                if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                    ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                }
    
                if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                    ttd = ttd_minutes + ' мин.'
                }
                console.log('ttd_hours: ' + ttd_hours)
    
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                let txt = `Привет! Вы вошли как Администратор <b>` + result.val().point_name + `</b>
`
    
                if (result.val().other_info.stats.feedbacks_amount >= 5){
                    txt += `
<b>⭐️ Ваш рейтинг:</b> ` + rating
                }
                if (result.val().other_info.stats.delivery_time > 0) {
                    txt += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                }
    
                bot.sendMessage(chat.id, txt, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.admin_menu_keyboard
                    }
                })
                .then(res => {
                    message_text[chat.id][6] = res.text
                    message_toedit[chat.id][6] = res.message_id
                })
            }
            else {
                bot.sendMessage(chat.id,  text_notadmin[Math.floor(Math.random() * text_notadmin.length)])
            }
        }
        
        else {
            bot.sendMessage(chat.id,  text_notadmin[Math.floor(Math.random() * text_notadmin.length)])
        }
    })
        
    }
    //САППОРТ
    if (query.data === keyboards.admin_menu_buttons[4][1]){
        var other_data = fb.database().ref('Motherbase/contacts')
        other_data.get().then((snapshot) => {
            bot.sendMessage(chat.id, `Возникли проблемы? Свяжитесь с нами и мы поможем в кратчайшие сроки ⌚️ 
Email: `+ snapshot.val().email + `
Телефон: ` + snapshot.val().phone + `
Аккаунт в телеграме: ` + snapshot.val().tgusername, {
        parse_mode: 'HTML', })
        .then(res => {
            message_toedit[chat.id][7] = res.message_id
            message_text[chat.id][7] = res.text
        })

        })
    }
    //ВКЛАДКА НАСТРОЕК
    if (query.data ===  keyboards.admin_menu_buttons[0][1]){
        bot.deleteMessage(chat.id, message_toedit[chat.id][7]).catch(() => {})
        bot.editMessageText(message_text[chat.id][6], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][6]
        })
        .then(() => {
            var other_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/')
            other_data.get().then((snapshot) => 
            {
                help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
                point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
                point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
                point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude
    
                point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
                point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal
    
                delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
                delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
                point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
                point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount
    
                //point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time
                point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
                point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
                //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
                point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
                //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]
    
                point_rating[chat.id] = snapshot.val().other_info.stats.rating
                point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time
    
                delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
                console.log('325 ' + delivery_chat[chat.id])
    
                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))
    
                let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
                let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
                console.log(time_now.getTime() < restriction_time_min)
    
                let ttd_ms = snapshot.val().other_info.stats.delivery_time
                let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
    
                ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                let ttd 
                if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                    ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                }
    
                if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                    ttd = ttd_minutes + ' мин.'
                }
                console.log('ttd_hours: ' + ttd_hours)
        
            })
            bot.sendMessage(chat.id, 'В этом разделе Вы можете изменить некоторую информацию о своем заведении', {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: keyboards.admin_preferences_keyboard
                }
            })
            .then(res => {
                message_toedit[chat.id][7] = res.message_id
                message_text[chat.id][7] = res.text
            })
        })
    }
    //НА ГЛАВНУЮ
    if (query.data === keyboards.admin_preferences_buttons[3][1]){
        bot.deleteMessage(chat.id, message_toedit[chat.id][7])
        bot.editMessageText(message_text[chat.id][6], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][6],
            reply_markup: {
                inline_keyboard: keyboards.admin_menu_keyboard
            }
        })
        .then(res => {
            message_toedit[chat.id][7] = null
            message_text[chat.id][7] = null
        })
        
    }
    //НАСТРОЙКИ ПО ДОСТАВКЕ
    if (query.data === keyboards.admin_preferences_buttons[0][1]){
        
        bot.editMessageText('Указанные ниже данные отображаются у Ваших клиентов. Чем больше заполнено - тем лучше', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: 'backtoalldata_cb'
                    },
                    {
                        text: keyboard_admin_delset[0][0] + delivery_min_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[0][1]
                    }],
                    [{
                        text: keyboard_admin_delset[1][0] + delivery_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[1][1]
                    },
                    {
                        text: keyboard_admin_delset[2][0],
                        callback_data: keyboard_admin_delset[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_delset[0][1]){
        isChangingDelivery[chat.id] = 1
        bot.editMessageText('💵 Введите минимальную сумму для доставки. Клиент должен будет заказать больше этой суммы. Если минимальной суммы нет, отправьте цифру "0":', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[0][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_delset[1][1]){
        isChangingDelivery[chat.id] = 2
        bot.editMessageText('💵 Введите стоимость доставки. Если вы осуществляете доставку бесплатно, отправьте цифру "0":', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[0][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_delset[2][1]){
        isChangingDelivery[chat.id] = 2
        bot.editMessageText('У вас есть возможность принимать оплату доставки с бесконтактным способом с помощью курьера? (KASPI, Кассовый аппарат и тд?)', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[0][1]
                    }],
                    [{
                        text: 'Да',
                        callback_data: 'pwthbznal_cb'
                    },
                    {
                        text: 'Нет',
                        callback_data: 'dpwtbznal_cb'
                    }]
                ]
            }
        })
    }
    if (query.data === 'pwthbznal_cb'){
        let updates = {}
        updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/payments/pay_beznal'] = true
        fb.database().ref().update(updates)

        bot.editMessageText('Указанные ниже данные отображаются у Ваших клиентов. Чем больше заполнено - тем лучше', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_delset[0][0] + delivery_min_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[0][1]
                    }],
                    [{
                        text: keyboard_admin_delset[1][0] + delivery_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[1][1]
                    },
                    {
                        text: keyboard_admin_delset[2][0],
                        callback_data: keyboard_admin_delset[2][1]
                    }]
                ]
            }
        })

    }
    if (query.data === 'dpwtbznal_cb'){
        let updates = {}
        updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/other_info/payments/pay_beznal'] = false
        fb.database().ref().update(updates)

        bot.editMessageText('Указанные ниже данные отображаются у Ваших клиентов. Чем больше заполнено - тем лучше', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_delset[0][0] + delivery_min_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[0][1]
                    }],
                    [{
                        text: keyboard_admin_delset[1][0] + delivery_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_delset[1][1]
                    },
                    {
                        text: keyboard_admin_delset[2][0],
                        callback_data: keyboard_admin_delset[2][1]
                    }]
                ]
            }
        })

    }
    //НАСТРОЙКИ ПО ВРЕМЕНИ РАБОТЫ
    if (query.data === keyboards.admin_preferences_buttons[1][1]){
        bot.editMessageText('Тут вы можете настроить часы работы доставки. Мы уведомим Ваших клиентов, если будет слишком рано или поздно.', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_times[1][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_times[0][0] + ' c ' + point_workingtime[chat.id][0][0] + ':' + point_workingtime[chat.id][0][1] + ' по ' + point_workingtime[chat.id][1][0] + ':' + point_workingtime[chat.id][1][1],
                        callback_data: keyboard_admin_times[0][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_times[0][1]){
        isChangingTime[chat.id] = 1
        bot.editMessageText('Укажите часы работы службы доставки в формате ЧЧ:ММ-ЧЧ:ММ. Если вы укажите часы работы по-другому, время не изменится: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[1][1]
                    }]
                ]
            }
        })
    }
    //НАСТРОЙКИ КОНТАКТОВ
    if (query.data === keyboards.admin_preferences_buttons[2][1]){
        bot.editMessageText('Укажите данные для связи с вами. Клиент увидит их когда выберет ваше заведение', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[3][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_phone[0][0] + help_phone[chat.id],
                        callback_data: keyboard_admin_phone[0][1]
                    },
                    {
                        text: keyboard_admin_phone[1][0] + point_location[chat.id][0] + ', ' + point_location[chat.id][1],
                        callback_data: keyboard_admin_phone[1][1]
                    }],
                    [{
                        text: keyboard_admin_phone[2][0] + point_adress[chat.id],
                        callback_data: keyboard_admin_phone[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_phone[0][1]){
        isChangingPhone[chat.id] = 1
        bot.editMessageText('Укажите номер телефона, по которому может позвонить Ваш клиент в случае возникновения вопросов: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_phone[1][1]){
        isChangingPhone[chat.id] = 2
        bot.editMessageText('Отправьте геолокацию точки, из которой осуществляется доставка. Найдите скрепку в левом нижнем углу (справка от кнопки меню) и выберите "Геопозиция":', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === keyboard_admin_phone[2][1]){
        isChangingPhone[chat.id] = 3
        bot.editMessageText('Напишите адрес, из которого осуществляется доставка:', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_delset[3][0],
                        callback_data: keyboards.admin_preferences_buttons[2][1]
                    }]
                ]
            }
        })
    }
    //НАЗАД В НАСТРОЙКИ
    if (query.data === 'backtoalldata_cb'){
        
        bot.editMessageText(message_text[chat.id][7], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: keyboards.admin_preferences_keyboard
            }
        })
    }

    //ВКЛАДКА РАССЫЛОК
    if (query.data ===  keyboards.admin_menu_buttons[1][1]){
        bot.deleteMessage(chat.id, message_toedit[chat.id][7]).catch(() => {})
        bot.editMessageText(message_text[chat.id][6], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][6]
        })
        .then(() => {
            var other_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/mailing')
            other_data.get().then((snapshot) => {
                if (snapshot.val().preferences.is_active === true){
                    isMailingMessage[chat.id] = 1
                    bot.sendMessage(chat.id, 'Вы можете отправить письмо всем своим клиентам. Введите текст сообщения: ', {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: keyboards.admin_preferences_buttons[3][0],
                                    callback_data: keyboards.admin_preferences_buttons[3][1]
                                }]
                            ]
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][7] = res.message_id
                        message_text[chat.id][7] = res.text
                    })
                }
                else if(snapshot.val().preferences === undefined || snapshot.val().preferences.is_active !== true){
                    var other_data1 = fb.database().ref('Motherbase/contacts')
                    other_data1.get().then((snapshot2) => {
                        let nick = snapshot2.val().tgusername
                        if (nick.includes('@')){
                            nick = nick.slice(1)
                        }
                        bot.sendMessage(chat.id, 'Создавайте скидочные купоны и отправляйте их с помощью рассылки своим клиентам. Поднимите уровень продаж на новый уровень с тарифом "Базовый" 🤩', {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: keyboards.admin_preferences_buttons[3][0],
                                        callback_data: keyboards.admin_preferences_buttons[3][1]
                                    }],
                                    [{
                                        text: 'Повысить тариф 🔋',
                                        url: 'https://t.me/' + nick
                                    }]
                                ]
                            }
                        })
                        .then(res => {
                            message_toedit[chat.id][7] = res.message_id
                            message_text[chat.id][7] = res.text
                        })
                        
                    })
                }
            })
            
        })
    }
    if (query.data === sendmessage_cb){
        StartMailing(mailing_text[chat.id], chat.id)
        bot.deleteMessage(chat.id, message_toedit[chat.id][6])
        .then(() => {
            bot.editMessageText('Рассылка запущена! Чем еще займемся? 😏', {
                chat_id: chat.id,
                message_id: message_toedit[chat.id][7],
                reply_markup: {
                    inline_keyboard: keyboards.admin_menu_keyboard
                }
            })
            .then(res => {
                message_toedit[chat.id][6] = res.message_id
                message_toedit[chat.id][7] = null
            })
        })
    }

    //ВКЛАДКА КУПОНОВ
    if (query.data ===  keyboards.admin_menu_buttons[3][1]){
        bot.deleteMessage(chat.id, message_toedit[chat.id][7]).catch(() => {})
        bot.editMessageText(message_text[chat.id][6], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][6]
        }).catch(() => {})
        let kb = []
        kb[0] = [{
            text: keyboards.admin_preferences_buttons[3][0],
            callback_data: keyboards.admin_preferences_buttons[3][1]
        }]

        var other_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system')
        other_data.get().then((snapshot) => {
            if (coupondata[chat.id] === undefined){
                coupondata[chat.id] = []
            }
            if (snapshot.val().preferences.coupons.is_active === true){
                let coupons
                if (snapshot.val().coupons !== undefined){
                    coupons = Object.keys(snapshot.val().coupons)
                    coupondata[chat.id][1] = snapshot.val().preferences.coupons.max_activ
                    if (coupons.length < snapshot.val().preferences.coupons.max_coupons) {
                        kb[0][1] = {
                            text: keyboards.admin_preferences_buttons[4][0],
                            callback_data: keyboards.admin_preferences_buttons[4][1]
                        }
        
                        for (let i = 0; i<coupons.length; i++){ 
                            var other_data1 = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i])
                            other_data1.get().then((result) => {
                                kb[i+1] = [{
                                    text: result.val().name,
                                    callback_data: 'readcoupon_' + coupons[i]
                                }]
        
                                if (i === coupons.length - 1){
                                    bot.sendMessage(chat.id, 'Вы можете создать скидочный купон и выдавать его своим клиентам. Один купон могут использовать до '+ snapshot.val().preferences.coupons.max_activ +' человек', {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            inline_keyboard: kb
                                        }
                                    })
                                    .then(res => {
                                        message_toedit[chat.id][7] = res.message_id
                                        message_text[chat.id][7] = res.text
                                    })
                                }
                            })
                            
                        }
        
                        
                    }
                    else {
                        for (let i = 0; i<coupons.length; i++){ 
                            var other_data1 = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i])
                            other_data1.get().then((result) => {
                                kb[i+1] = [{
                                    text: result.val().name,
                                    callback_data: 'readcoupon_' + coupons[i]
                                }]
        
                                if (i === coupons.length - 1){
                                    bot.sendMessage(chat.id, 'Вы можете создать скидочный купон и выдавать его своим клиентам. Один купон могут использовать до '+ snapshot.val().preferences.coupons.max_activ +' человек', {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            inline_keyboard: kb
                                        }
                                    })
                                    .then(res => {
                                        message_toedit[chat.id][7] = res.message_id
                                        message_text[chat.id][7] = res.text
                                    })
                                }
                            })
                            
                        }
        
                        
                    }
                }
                else {
                    coupondata[chat.id][1] = snapshot.val().preferences.coupons.max_activ
                    kb[0] = [{
                        text: keyboards.admin_preferences_buttons[3][0],
                        callback_data: keyboards.admin_preferences_buttons[3][1]
                    }, 
                    {
                        text: keyboards.admin_preferences_buttons[4][0],
                        callback_data: keyboards.admin_preferences_buttons[4][1]
                    }]
    
                    bot.sendMessage(chat.id, 'Вы можете создать скидочный купон и выдавать его своим клиентам. Один купон могут использовать до '+ snapshot.val().preferences.coupons.max_activ +' человек', {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: kb
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][7] = res.message_id
                        message_text[chat.id][7] = res.text
                    })
                }
            }
            else if (snapshot.val().preferences === undefined || snapshot.val().preferences.coupons.is_active !== true) {
                var other_data1 = fb.database().ref('Motherbase/contacts')
                other_data1.get().then((snapshot2) => {
                    let nick = snapshot2.val().tgusername
                    if (nick.includes('@')){
                        nick = nick.slice(1)
                    }
                    bot.sendMessage(chat.id, 'Создавайте скидочные купоны и отправляйте их с помощью рассылки своим клиентам. Поднимите уровень продаж на новый уровень с тарифом "Базовый" 🤩', {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: keyboards.admin_preferences_buttons[3][0],
                                    callback_data: keyboards.admin_preferences_buttons[3][1]
                                }],
                                [{
                                    text: 'Повысить тариф 🔋',
                                    url: 'https://t.me/' + nick
                                }]
                            ]
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][7] = res.message_id
                        message_text[chat.id][7] = res.text
                    })
                    
                })
               
            }
        })
    }

    if (query.data.includes('readcoupon_')){
        let coupon_name = query.data.split('_')
        coupon_name = coupon_name[1]
        var other_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupon_name)
        other_data.get().then((snapshot) => {
            let txt = `Купон <b>`+ snapshot.val().name +`</b>
Скидка: <b>` + snapshot.val().percent + `%</b>
Активаций сделано: <b>` + snapshot.val().activated + `</b>
Активаций осталось: <b>` + snapshot.val().activ_left + `</b>`
            bot.editMessageText(txt , {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][7],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '◀️ Назад',
                            callback_data: keyboards.admin_menu_buttons[3][1]
                        }],
                        [{
                            text: '❌ Удалить купон',
                            callback_data: 'delcoupon_' + coupon_name
                        }]
                    ]
                }
            })
        })
    }

    if (query.data.includes('delcoupon_')){
        let coupon_name = query.data.split('_')
        coupon_name = coupon_name[1]
        let updates = {};
        updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/loyal_system/coupons/' + coupon_name] = null
        fb.database().ref().update(updates)
        bot.deleteMessage(chat.id, message_toedit[chat.id][7]).catch(() => {})
        bot.editMessageText(message_text[chat.id][6], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][6]
        }).catch(() => {})
        let kb = []
        kb[0] = [{
            text: keyboards.admin_preferences_buttons[3][0],
            callback_data: keyboards.admin_preferences_buttons[3][1]
        }]
        var other_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system')
        other_data.get().then((snapshot) => {
            if (snapshot.val().coupons !== undefined){
                let coupons = Object.keys(snapshot.val().coupons)
                if (coupons.length < snapshot.val().preferences.coupons.max_coupons) {
                    kb[1] = [{
                        text: keyboards.admin_preferences_buttons[4][0],
                        callback_data: keyboards.admin_preferences_buttons[4][1]
                    }]
    
                    for (let i = 0; i<coupons.length; i++){ 
                        var other_data1 = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i])
                        other_data1.get().then((result) => {
                            kb[i+2] = [{
                                text: result.val().name,
                                callback_data: 'readcoupon_' + coupons[i]
                            }]
    
                            if (i === coupons.length - 1){
                                bot.sendMessage(chat.id, 'Купон был успешно удален', {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: kb
                                    }
                                })
                                .then(res => {
                                    message_toedit[chat.id][7] = res.message_id
                                    message_text[chat.id][7] = res.text
                                })
                            }
                        })
                        
                    }
    
                    
                }
                else {
                    for (let i = 0; i<coupons.length; i++){ 
                        var other_data1 = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i])
                        other_data1.get().then((result) => {
                            kb[i+1] = [{
                                text: result.val().name,
                                callback_data: 'readcoupon_' + coupons[i]
                            }]
    
                            if (i === coupons.length - 1){
                                bot.sendMessage(chat.id, 'Купон был успешно удален', {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: kb
                                    }
                                })
                                .then(res => {
                                    message_toedit[chat.id][7] = res.message_id
                                    message_text[chat.id][7] = res.text
                                })
                            }
                        })
                        
                    }
    
                    
                }
            }
            else {
                kb[1] = [{
                    text: keyboards.admin_preferences_buttons[4][0],
                    callback_data: keyboards.admin_preferences_buttons[4][1]
                }]

                bot.sendMessage(chat.id, 'Купон был успешно удален', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: kb
                    }
                })
                .then(res => {
                    message_toedit[chat.id][7] = res.message_id
                    message_text[chat.id][7] = res.text
                })
            }
        })
    }

    if (query.data === keyboards.admin_preferences_buttons[4][1]){
        isCreatingCoupon[chat.id] = 1
        bot.editMessageText('Введите код купона. Он может быть любым, но клиенту нужно будет точь-в-точь его скопировать:' , {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: keyboards.admin_menu_buttons[3][1]
                    }]
                ]
            }
        })
    }

    //СТОП-ЛИСТЫ
    if (query.data === keyboards.admin_menu_buttons[2][1]){
        let categories_data = fb.database().ref('Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/other_info/pricing/stoplists')
        categories_data.get().then((snapshot) => {
            if (snapshot.val() === true){
                bot.deleteMessage(chat.id, message_toedit[chat.id][6]).catch(() => {})
                keyboards.CategoriesKeyboardAdmin(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, 'Выберите нужную категорию: ', location_text, phone_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id] , message_toedit[chat.id], message_text[chat.id], openadminpanel[1]) 
            }
            else {
                var other_data1 = fb.database().ref('Motherbase/contacts')
                other_data1.get().then((snapshot2) => {
                    let nick = snapshot2.val().tgusername
                    if (nick.includes('@')){
                        nick = nick.slice(1)
                    }
                    bot.editMessageText('Создавайте скидочные купоны и отправляйте их с помощью рассылки своим клиентам. Поднимите уровень продаж на новый уровень с тарифом "Базовый" 🤩', {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][6],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: keyboards.admin_preferences_buttons[3][0],
                                    callback_data: openadminpanel[1]
                                }],
                                [{
                                    text: 'Повысить тариф 🔋',
                                    url: 'https://t.me/' + nick
                                }]
                            ]
                        }
                    })
                })
                
            }
        })
        
    }

    if (query.data === keyboards.admin_menu_buttons[2][1] + '_sec'){
        bot.deleteMessage(chat.id, message_toedit[chat.id][7]).catch(() => {})
        keyboards.CategoriesKeyboardAdmin(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, 'Выберите нужную категорию: ', location_text, phone_text, UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id] , message_toedit[chat.id], message_text[chat.id], openadminpanel[1]) 
    }

    if (query.data.includes('_admnctcb')){
        bot.deleteMessage(chat.id, message_toedit[chat.id][7])
        userCategory[chat.id] = query.data.split('_')
        userCategory[chat.id] = userCategory[chat.id][0]
        keyboards.FoodKeyboardAdmin(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query,  'Нажмите на товар, чтобы добавить его в стоп-лист. Если рядом с ним значок "🔘" - он включен и отображается. ⚪️ - отключен', UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id], message_toedit[chat.id], message_text[chat.id])
    }

    if (query.data.includes('admnturnoff_')){
        let num = query.data.split('_')
        console.log('num:' + num[1] + ', ' + query.data)

        let updates = {}
        updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/delivery_menu/categories/' + userCategory[chat.id] + '/food/' + num[1] + '/is_active'] = false
        fb.database().ref().update(updates)

        bot.deleteMessage(chat.id, message_toedit[chat.id][7])
        keyboards.FoodKeyboardAdmin(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query,  'Нажмите на товар, чтобы добавить его в стоп-лист. Если рядом с ним значок "🔘" - он включен и отображается. ⚪️ - отключен', UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id], message_toedit[chat.id], message_text[chat.id])
        
    }

    if (query.data.includes('admnturnon_')){
        let num = query.data.split('_')
        console.log('num:' + num[1] + ', ' + query.data)

        let updates = {}
        updates['Delivery/' + UserDelCat[chatId] + '/' + userPoint[chatId] + '/delivery_menu/categories/' + userCategory[chat.id] + '/food/' + num[1] + '/is_active'] = true
        fb.database().ref().update(updates)

        bot.deleteMessage(chat.id, message_toedit[chat.id][7])
        keyboards.FoodKeyboardAdmin(foodlist_keyboard[chat.id], userFoodlist[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, 'Нажмите на товар, чтобы добавить его в стоп-лист. Если рядом с ним значок "🔘" - он включен и отображается. ⚪️ - отключен', UserDelCat[chat.id], userPoint[chat.id], user_mode[chat.id], message_toedit[chat.id], message_text[chat.id])
    }

    if (query.data.includes('admnerr_')){
        let num = query.data.split('_')
        console.log('num:' + num[1])

        bot.editMessageText('‼️ Этот товар содержит ошибки. Свяжитесь с службой поддержки ‼️', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_toedit[chat.id][7],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: keyboards.admin_menu_buttons[2][1]
                    }]
                ]
            }
        })
    }

    }

    if (chat.type === 'group' || chat.type === 'supergroup'){
        bot.getChat(chat.id).then((result0) => {
            if (result0.description !== null || result0.description !== undefined){
                let del_userdata = []
                console.log(result0)
                del_userdata[chat.id] = result0.description.split(',') // [0] - категория, [1] - точка
                if (del_userdata[chat.id].length === 2){
                    let userdata = fb.database().ref('Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] +'/bills/')
                    userdata.get().then((result) => {
                        let bills_array = Object.keys(result.val())
                        console.log('Вы нажимаете на кнопку callback для доставщиков: ' + query.data + ', array = ' + bills_array.length)
                        for(let i = bills_array.length - 1; i >= 0; i--){
                            console.log(i + ' Processing... ' + query.data + ', ' + (accept_order_callback + bills_array[i]))
                            if (query.data === accept_order_callback + bills_array[i].toString()){
                                accepted_order_name = bills_array[i]
                                console.log('Вы приняли заказ: ' + accepted_order_name)
                                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                                let orderinfo = fb.database().ref('Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {
                                    console.log(query)
                                    console.log('deliverer name2 : ' + query.message.from.first_name + ', ' + query.message.from.id)
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let accept_date = new Date(utcTime + (3600000 * timeOfffset))
                                    //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
                                    let updates = {}
/*                                     let order_update = {
                                        adress: snapshot.val().adress,
                                        client_name: snapshot.val().client_name,
                                        date_ordered: snapshot.val().date_ordered,
                                        client_id: snapshot.val().client_id,
                                        order_info: snapshot.val().order_info,
                                        phone: snapshot.val().phone,
                                        price: snapshot.val().price,
                                        order_status: order_statuses_text[1],
                                        deliver_name: query.from.first_name.toString(),
                                        accept_date: accept_date.getTime(),
                                        deliver_id: query.from.id.toString(),
                                        message_id: query.message.message_id,
                                        user_personsamount: snapshot.val().user_personsamount,
                                        user_payingmethod: snapshot.val().user_payingmethod,
                                        user_deliverdate: snapshot.val().user_deliverdate,
                                        user_sdachainfo: snapshot.val().user_sdachainfo,
                                        user_howtocome: snapshot.val().user_howtocome
                                    } */
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/order_status'] = order_statuses_text[1]
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/deliver_name'] = query.from.first_name
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/accept_date'] = accept_date.getTime()
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/deliver_id'] = query.from.id.toString()
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/message_id'] = query.message.message_id
                                    fb.database().ref().update(updates)
                
                                    /////ИЗМЕНЯЕМ ЧЕК///////////////
                
                                    let options = { weekday: 'short'}
                                    let Astana_date = new Date(snapshot.val().date_ordered)
                                    
                                    let minutes = Astana_date.getMinutes()
                                    if (minutes < 10) minutes = '0' + minutes
                                    let hours = Astana_date.getHours()
                                    if (hours < 10) hours = '0' + hours
                                    let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
                
                                    let Astana_date_accept = new Date(accept_date)  
                                    let minutes2 = Astana_date_accept.getMinutes()
                                    if (minutes2 < 10) minutes2 = '0' + minutes2
                                    let hours2 = Astana_date_accept.getHours()
                                    if (hours2 < 10) hours2 = '0' + hours2
                                    let visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1)                                   
                
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
deliver_bill_help_info = `<b>📌 Доп. информация</b>`

if (snapshot.val().user_personsamount !== undefined){
    deliver_bill_help_info += `
├ Кол-во персон: ` + snapshot.val().user_personsamount
}

deliver_bill_help_info += `
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
                                let orderinfo = fb.database().ref('Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let refuse_date = new Date(utcTime + (3600000 * timeOfffset))

                                    //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
                                    let updates = {}
/*                                     let order_update = {
                                        adress: snapshot.val().adress,
                                        client_name: snapshot.val().client_name,
                                        date_ordered: snapshot.val().date_ordered,
                                        client_id: snapshot.val().client_id,
                                        order_info: snapshot.val().order_info,
                                        phone: snapshot.val().phone,
                                        price: snapshot.val().price,
                                        order_status: order_statuses_text[3],
                                        deliver_name: query.from.first_name.toString(),
                                        accept_date: refuse_date.getTime(),
                                        deliver_id: query.from.id.toString(),
                                        message_id: query.message.message_id,
                                        user_personsamount: snapshot.val().user_personsamount,
                                        user_payingmethod: snapshot.val().user_payingmethod,
                                        user_deliverdate: snapshot.val().user_deliverdate,
                                        user_sdachainfo: snapshot.val().user_sdachainfo,
                                        user_howtocome: snapshot.val().user_howtocome,
                                        
                                    } */
                                    
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/order_status'] = order_statuses_text[3]
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/deliver_name'] = query.from.first_name
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/accept_date'] = refuse_date.getTime()
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/deliver_id'] = query.from.id.toString()
                                    updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/message_id'] = query.message.message_id
                                    fb.database().ref().update(updates)
                
                                    /////ИЗМЕНЯЕМ ЧЕК///////////////
                                    let options = { weekday: 'short'}
                                    let Astana_date = new Date(snapshot.val().date_ordered)
                                    
                let minutes = Astana_date.getMinutes()
                if (minutes < 10) minutes = '0' + minutes
                let hours = Astana_date.getHours()
                if (hours < 10) hours = '0' + hours
                let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
                
                let Astana_date_accept = new Date(refuse_date)
                let minutes2 = Astana_date_accept.getMinutes()
                if (minutes2 < 10) minutes2 = '0' + minutes2
                let hours2 = Astana_date_accept.getHours()
                if (hours2 < 10) hours2 = '0' + hours2
                let visible_date_refuse = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1)                                   
                
                                    deliver_bill_topic = deliver_bill_topic_names[2] + query.from.first_name.toString()
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
deliver_bill_help_info = `<b>📌 Доп. информация</b>`

if (snapshot.val().user_personsamount !== undefined){
    deliver_bill_help_info += `
├ Кол-во персон: ` + snapshot.val().user_personsamount
}

deliver_bill_help_info += `
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
                                let orderinfo = fb.database().ref('Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {
                                    if (query.from.id.toString() === snapshot.val().deliver_id){
                                        
                                        let date = new Date()
                                        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                        let timeOfffset = 6 //Astana GMT +6
                                        let delivered_date = new Date(utcTime + (3600000 * timeOfffset))
                                        //обновляем чек (!!! Нужно делать тоже самое для чека клиента)
                    
                                        /////ИЗМЕНЯЕМ ЧЕК///////////////
                                        let options = { weekday: 'short'}
                                        let Astana_date = new Date(snapshot.val().date_ordered)
                                        
                let minutes = Astana_date.getMinutes()
                if (minutes < 10) minutes = '0' + minutes
                let hours = Astana_date.getHours()
                if (hours < 10) hours = '0' + hours
                let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
                
                let Astana_date_accept = new Date(snapshot.val().accept_date)  
                let minutes2 = Astana_date_accept.getMinutes()
                if (minutes2 < 10) minutes2 = '0' + minutes2
                let hours2 = Astana_date_accept.getHours()
                if (hours2 < 10) hours2 = '0' + hours2
                let visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1)                                   
                
                
                let Astana_date_delivered = new Date(delivered_date)  
                let minutes3 = Astana_date_delivered.getMinutes()
                if (minutes3 < 10) minutes3 = '0' + minutes3
                let hours3 = Astana_date_delivered.getHours()
                if (hours3 < 10) hours3 = '0' + hours3
                let visible_date_delivered = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_delivered) + ' ' +  */hours3 + ':' + minutes3 + ', ' + Astana_date_delivered.getDate() + '.' + (Astana_date_delivered.getMonth() + 1)                                      
                                        
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
deliver_bill_help_info = `<b>📌 Доп. информация</b>`

if (snapshot.val().user_personsamount !== undefined){
    deliver_bill_help_info += `
├ Кол-во персон: ` + snapshot.val().user_personsamount
}

deliver_bill_help_info += `
├ Способ оплаты: ` + snapshot.val().user_payingmethod + `
├ Купюра оплаты: ` + snapshot.val().user_sdachainfo + `
└ Когда доставить: ` + snapshot.val().user_deliverdate + `

<b>🚴‍♂️ Как пройти?</b>
` + snapshot.val().user_howtocome + `

`
                delivers_bill = deliver_bill_topic + deliver_bill_client_info + deliver_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
                                        
                                            let updates = {}
                                           /*  let order_update = {
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
                                                delivered_date: delivered_date.getTime(),
                                                message_id: query.message.message_id,
                                                bill_text: delivers_bill,
                                                user_personsamount: snapshot.val().user_personsamount,
                                                user_payingmethod: snapshot.val().user_payingmethod,
                                                user_deliverdate: snapshot.val().user_deliverdate,
                                                user_sdachainfo: snapshot.val().user_sdachainfo,
                                                user_howtocome: snapshot.val().user_howtocome
                                            } */
                                            
                                            updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/order_status'] = order_statuses_text[2]
                                            updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/deliver_name'] = query.from.first_name
                                            updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/delivered_date'] = delivered_date.getTime()
                                            updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/deliver_id'] = query.from.id.toString()
                                            updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/message_id'] = query.message.message_id
                                            updates['Delivery/'+ del_userdata[chat.id][0] + '/' + del_userdata[chat.id][1] + '/bills/' + bills_array[i] + '/bill_text'] = delivers_bill

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
                                    message_id: query.message.message_id
                                })
                            }
                        }
                    })
                }
            }
            else {
                bot.sendMessage(chat.id, 'Извините, этот бот пока не работает в группах и каналах 🥺')
            }
        })
    
    }
})
bot.onText(/\/my_order/, msg => {

    const { chat, message_id, text } = msg
    const chatId = chat.id
    if (order_status[chatId] === 'unknown'){
        if (buttons_message[chatId] !== 0){
            console.log('basket: ' + basket[chat.id])
            bot.deleteMessage(chatId, buttons_message[chatId]).catch(err => {
                console.log(err)
            })
            if (message_toedit[chat.id][1] !== undefined){
                bot.deleteMessage(chatId, message_toedit[chat.id][1]).catch(err => {
                    console.log(err)
                })
            }
            bot.deleteMessage(chatId, message_id - 1).catch(err => {console.log('! ' + err)})
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chatId].length; i++){
                                finalsum += (basket[chatId][i][2] * basket[chatId][i][1])   
                                if (i === basket[chatId].length - 1){
                                    if (coupondata[chat.id] !== undefined){
                                        editmsg += `
Новая цена по промокоду ` + coupondata[chat.id][0] + `: ` + Math.floor(finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100)))
                                        finalsum = finalsum - (finalsum * (parseInt(coupondata[chat.id][1]) / 100))
                                        console.log('1finalsum: ' +finalsum)
                                        if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                            editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                        }
                                    }
                                    else if (coupondata[chat.id] === undefined){
                                        editmsg += finalsum + 'тг.'
                                        if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown'){
                                            editmsg += ` +` + delivery_price[chat.id] + 'тг. (доставка)'
                                        }
                                    }
                                    console.log(finalsum + ' ' + i)
                                    finalprice[chatId] = finalsum + delivery_price[chat.id]
                                    console.log('finalprice: ' +finalprice[chat.id] + ', finalsum: ' + finalsum)
                                    for (let i = 0; i < basket[chatId].length; i++){
                                        console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                        editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                        if (i === basket[chatId].length - 1){
                                            bot.sendMessage(chatId,  editmsg , {
                                                reply_markup:{
                                                    inline_keyboard: [
                                                        [{
                                                            text: anotherfood_text2[0],
                                                            callback_data: anotherfood_text2[1]
                                                        },
                                                        {
                                                            text: editbasket_text,
                                                            callback_data: editbasket_text
                                                        }],
                                                        [{
                                                            text: writecoupon[0],
                                                            callback_data: writecoupon[1]
                                                        }],
                                                        [{
                                                            text: paybasket_text[0],
                                                            callback_data: paybasket_text[1]
                                                        }]
                                                    ]
                                                }
                                            }).then(() => {
                                                buttons_message[chatId] = message_id
                                                console.log('& ' + buttons_message[chatId])
                                            })
                
                                        }
                                    }
                                }
                }
            
        }
        else {
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chatId, sticker_hello).then(() => {
                anotherpoint_multiple[chatId] = 2
                //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                bot.sendMessage(chatId, hellomessage_text, {
                    parse_mode: 'HTML',
                })
                keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
            })
        }
    }
    else {
        bot.deleteMessage(chatId, message_id)
    }

})
bot.onText(/\/Admin_controller:GetChatInfo/, msg =>
{
    //console.log(msg)
    const chatId = msg.chat.id
    bot.sendMessage(chatId, chatId)

})
bot.onText(/\/start/, msg => {
    
    const { chat, message_id, text } = msg
    const chatId = chat.id
    current_chat = chatId
    user_mode[chat.id] = 'delivery_menu'
    console.log('order_status: ' + order_status[chatId])
    if (order_status[chatId] === 'unknown' || order_status[chatId] === undefined){

        if (text.includes('_deladmin')) {
            let inform = text.split(' ')
            inform = inform[1].split('_')
            if (inform.length === 4){
                Reset(chat.id)
                UserDelCat[chat.id] = inform[2]
                userPoint[chat.id] = inform[3]
                
    
                let cbadmin_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id])
                cbadmin_data.get().then((result) => {
                    
                    if (result.val().chats !== undefined){
                        
                        if (result.val().chats.admin === chat.id){
                            
                            isMailingMessage[chat.id] = 0
                            //isChangingPrefs[chat.id] = 0
                            isChangingPhone[chat.id] = 0
                            isChangingTime[chat.id] = 0
                            isChangingDelivery[chat.id] = 0
                            isCreatingCoupon[chat.id] = 0
                            mailing_text[chat.id] = ''
                            
                            isAdmin[chat.id] = true
                            //message_text[chat.id] = []
                            //message_toedit[chat.id] = []

                            UserDelCat[chat.id] = inform[2]
                            userPoint[chat.id] = inform[3]
                
                            point_rating[chat.id] = result.val().other_info.stats.rating
                            point_delivery_time[chat.id] = result.val().other_info.stats.delivery_time
                
                            let rating
                            if (point_rating[chat.id] < 1){
                                rating = feedback_options[0] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                            }
                
                            if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                                rating = feedback_options[1] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                            }
                
                            if (point_rating[chat.id] > 2){
                                rating = feedback_options[2] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                            }
                
                            let ttd_ms = result.val().other_info.stats.delivery_time
                            let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                            let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                            let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
                
                            ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                            ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                            ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                
                            let ttd 
                            if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                                ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                            }
                
                            if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                                ttd = ttd_minutes + ' мин.'
                            }
                            console.log('ttd_hours: ' + ttd_hours)
                            
                
                            for (let i=0; i<100; i++){
                                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                                    //console.log(err)
                                })
                            }
                            let txt = `Привет! Вы вошли как Администратор <b>` + result.val().point_name + `</b>
`
                
                            if (result.val().other_info.stats.feedbacks_amount >= 5){
                                txt += `
<b>⭐️ Ваш рейтинг:</b> ` + rating
                            }
                            if (result.val().other_info.stats.delivery_time > 0) {
                                txt += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                            }
                            
                            bot.sendMessage(chat.id, txt, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: keyboards.admin_menu_keyboard
                                }
                            })
                            .then(res => {
                                message_text[chat.id][6] = res.text
                                message_toedit[chat.id][6] = res.message_id
                            })

                            
                        }
                        else {
                            bot.sendMessage(chat.id,  text_notadmin[Math.floor(Math.random() * text_notadmin.length)])
                        }
                    }
                    
                    else {
                        bot.sendMessage(chat.id,  text_notadmin[Math.floor(Math.random() * text_notadmin.length)])
                    }
                })
            }
            else {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_hello).then(() => {
                    anotherpoint_multiple[chatId] = 2
                    //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                    bot.sendMessage(chatId, hellomessage_text, {
                        parse_mode: 'HTML',
                    })
                    keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                    //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                    //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
                })
            }
            
        }

        if (text.includes('_client')){
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            let inform = text.split(' ')
            inform = inform[1].split('_')
            console.log(inform.length)
            if (inform.length === 4){
                Reset(current_chat)
                UserDelCat[chat.id] = inform[2]
                userPoint[chat.id] = inform[3]

                let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
                point_info.get().then((snapshot) => {
        
                    help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
                    point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
                    point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
                    point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude
        
                    point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
                    point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal
        
                    delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
                    delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
                    point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
                    point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount
        
                    point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
                    point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
                    //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
                    point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
                    //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]
        
                    point_rating[chat.id] = snapshot.val().other_info.stats.rating
                    point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time
        
                    delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
                    console.log('325 ' + delivery_chat[chat.id])
        
                    let buttons_data = []
                    if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                        buttons_data.push({
                            text: sendadress_point[0],
                            callback_data: sendadress_point[1]
                        })
                    }
        
                    if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                        buttons_data.push({
                            text: sendphone_point[0],
                            callback_data: sendphone_point[1] 
                        })
                    }
        
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
        
                    let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
                    let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
                    console.log(time_now.getTime() < restriction_time_min)
        
                    let ttd_ms = snapshot.val().other_info.stats.delivery_time
                    let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                    let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                    let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
        
                    ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                    ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                    ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                    let ttd 
                    if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                        ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                    }
        
                    if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                        ttd = ttd_minutes + ' мин.'
                    }
                    console.log('ttd_hours: ' + ttd_hours)
        
                    let msgtext = `<b>` + snapshot.val().point_name + `</b>`
        
                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                        console.log('1 wrong TIME, time_now: ' + time_now)
                        user_deliverdate[chat.id] = 'Как можно раньше'
                        msgtext += ` (Закрыто)`
                    }
                    
                    let rating
                    if (point_rating[chat.id] < 1){
                        rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                    }
        
                    if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                        rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                    }
        
                    if (point_rating[chat.id] > 2){
                        rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                    }
                    if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                        msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
                    }
                    if (snapshot.val().other_info.stats.delivery_time > 0) {
                        msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                    }
        
                    msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time
        
                    if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
                        msgtext += `
<b>💰 Мин. сумма заказа:</b> ` + delivery_min_price[chat.id] + ` тенге.`
                    }
        
                    if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
                        msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
                    }
        
                    if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
                        msgtext += `
                        
` + snapshot.val().other_info.delivery_info.disclaimer
                    }
                    
                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                        console.log('2 wrong TIME, time_now: ' + time_now)
                        msgtext += `
        
<b>❗️ Внимание.</b> Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
                    }
        
                    let finalbuttons
                    if (snapshot.val().chats.admin !== chat.id){
                        finalbuttons = [{
                            text: anotherpoint_text,
                            callback_data: anotherpoint_text
                        },
                        {
                            text: loadcategories[0],
                            callback_data: loadcategories[1]
                        }]
                    }
        
                    if (snapshot.val().chats.admin === chat.id){
                        isAdmin[chat.id] = true
                        finalbuttons = [{
                            text: anotherpoint_text,
                            callback_data: anotherpoint_text
                        },
                        {
                            text: openadminpanel[0],
                            callback_data: openadminpanel[1]
                        }]
                    }
        
                    if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                        bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                            parse_mode: 'HTML',
                            caption: msgtext,
                            reply_markup: {
                                inline_keyboard: [
                                    buttons_data,
                                    finalbuttons
                                ]
                            }
                        }).then(res => {
                            message_toedit[chat.id][0] = res.message_id
                            message_text[chat.id][0] = res.caption
                        })
                        .catch(() => {
                            bot.sendMessage(chat.id, msgtext, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        buttons_data,
                                        finalbuttons
                                    ]
                                }
                            })
                            .then(res => {
                                message_toedit[chat.id][0] = res.message_id
                                message_text[chat.id][0] = res.text
                            })
                        })
                    }
                    if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                        bot.sendMessage(chat.id, msgtext, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    buttons_data,
                                    finalbuttons
                                ]
                            }
                        })
                        .then(res => {
                            message_toedit[chat.id][0] = res.message_id
                            message_text[chat.id][0] = res.text
                        })
                    }
                    
                })
            }
            else {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_hello).then(() => {
                    anotherpoint_multiple[chatId] = 2
                    //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                    bot.sendMessage(chatId, hellomessage_text, {
                        parse_mode: 'HTML',
                    })
                    keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                    //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                    //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
                })
            }
            
        }

        if (text.includes('_salelink')){
            bot.deleteMessage(chatId, message_id)
            let inform = text.split(' ')
            inform = inform[1].split('_')
            if (inform.length === 5){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                Reset(current_chat)
                buttons_message[chatId] = message_id
                UserDelCat[chat.id] = inform[2]
                userPoint[chat.id] = inform[3]
                let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons')
                point_info.get().then((snapshot) => {
                    if (snapshot.exists()){
                        let coupons = Object.keys(snapshot.val())
                        for (let i = 0; i < coupons.length; i++){
                            let gett = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i])
                            gett.get().then((res) => {
                                if (inform[4] === res.val().name){
                                    if (res.val().activ_left > 0){
                                        clients = res.val().clients 
                                        if (!clients.includes(chatId.toString())) {
                                            coupondata = []
                                            coupondata[chatId] = []
                                            coupondata[chatId][0] = res.val().name
                                            coupondata[chatId][1] = res.val().percent
            
                                            //let updates = {}
                                            //updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i] + '/activ_left'] = res.val().activ_left - 1
                                            //updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i] + '/activated'] = res.val().activated + 1
                                            //updates['Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/loyal_system/coupons/' + coupons[i] + '/clients'] = res.val().clients + ',' + chat.id
                                            
                                            //fb.database().ref().update(updates)
            
                                            //bot.deleteMessage(chatId, message_toedit[chatId][2])
                                            bot.sendMessage(chatId, `Промокод успешно активирован 🥳 
Вы получаете скидку ` + res.val().percent + `%. Бегом тратить!` , {
                                                parse_mode: 'HTML'
                                            })
                                            .then(res => {
                                                let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
                                                point_info.get().then((snapshot) => {
                                        
                                                    help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
                                                    point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
                                                    point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
                                                    point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude
                                        
                                                    point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
                                                    point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal
                                        
                                                    delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
                                                    delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
                                                    point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
                                                    point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount
                                        
                                                    point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
                                                    point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
                                                    //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
                                                    point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
                                                    //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]
                                        
                                                    point_rating[chat.id] = snapshot.val().other_info.stats.rating
                                                    point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time
                                        
                                                    delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
                                                    console.log('325 ' + delivery_chat[chat.id])
                                        
                                                    let buttons_data = []
                                                    if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                                                        buttons_data.push({
                                                            text: sendadress_point[0],
                                                            callback_data: sendadress_point[1]
                                                        })
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                                                        buttons_data.push({
                                                            text: sendphone_point[0],
                                                            callback_data: sendphone_point[1] 
                                                        })
                                                    }
                                        
                                                    let date = new Date()
                                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                                    let timeOfffset = 6 //Astana GMT +6
                                                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
                                        
                                                    let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
                                                    let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
                                                    console.log(time_now.getTime() < restriction_time_min)
                                        
                                                    let ttd_ms = snapshot.val().other_info.stats.delivery_time
                                                    let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                                                    let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                                                    let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
                                        
                                                    ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                                                    ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                                                    ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                                                    let ttd 
                                                    if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                                                        ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                                                    }
                                        
                                                    if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                                                        ttd = ttd_minutes + ' мин.'
                                                    }
                                                    console.log('ttd_hours: ' + ttd_hours)
                                        
                                                    let msgtext = `<b>` + snapshot.val().point_name + `</b>`
                                        
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('1 wrong TIME, time_now: ' + time_now)
                                                        user_deliverdate[chat.id] = 'Как можно раньше'
                                                        msgtext += ` (Закрыто)`
                                                    }
                                                    
                                                    let rating
                                                    if (point_rating[chat.id] < 1){
                                                        rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                                                        rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] > 2){
                                                        rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                                    if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                                                        msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
                                                    }
                                                    if (snapshot.val().other_info.stats.delivery_time > 0) {
                                                        msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                                                    }
                                        
                                                    msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time
                                        
                                                    if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Мин. сумма заказа:</b> ` + delivery_min_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
                                                        msgtext += `
                                                        
` + snapshot.val().other_info.delivery_info.disclaimer
                                                    }
                                                    
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('2 wrong TIME, time_now: ' + time_now)
                                                        msgtext += `
                                        
<b>❗️ Внимание.</b> Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
                                                    }
                                        
                                                    let finalbuttons
                                                    if (snapshot.val().chats.admin !== chat.id){
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        },
                                                        {
                                                            text: loadcategories[0],
                                                            callback_data: loadcategories[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().chats.admin === chat.id){
                                                        isAdmin[chat.id] = true
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        },
                                                        {
                                                            text: openadminpanel[0],
                                                            callback_data: openadminpanel[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                                                        bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                                                            parse_mode: 'HTML',
                                                            caption: msgtext,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        }).then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.caption
                                                        })
                                                        .catch(() => {
                                                            bot.sendMessage(chat.id, msgtext, {
                                                                parse_mode: 'HTML',
                                                                reply_markup: {
                                                                    inline_keyboard: [
                                                                        buttons_data,
                                                                        finalbuttons
                                                                    ]
                                                                }
                                                            })
                                                            .then(res => {
                                                                message_toedit[chat.id][0] = res.message_id
                                                                message_text[chat.id][0] = res.text
                                                            })
                                                        })
                                                    }
                                                    if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                                                        bot.sendMessage(chat.id, msgtext, {
                                                            parse_mode: 'HTML',
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        })
                                                        .then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.text
                                                        })
                                                    }
                                                    
                                                })
                                                message_toedit[chatId][2] = res.message_id
                                            })
                                        }
                                        else if (clients.includes(chatId.toString())){
                                            //bot.deleteMessage(chatId, message_toedit[chatId][2])
                                            bot.sendMessage(chatId, 'Вы уже использовали этот промокод', {
                                                parse_mode: 'HTML'
                                            })
                                            .then(res => {
                                                let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
                                                point_info.get().then((snapshot) => {
                                        
                                                    help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
                                                    point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
                                                    point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
                                                    point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude
                                        
                                                    point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
                                                    point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal
                                        
                                                    delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
                                                    delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
                                                    point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
                                                    point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount
                                        
                                                    point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
                                                    point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
                                                    //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
                                                    point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
                                                    //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]
                                        
                                                    point_rating[chat.id] = snapshot.val().other_info.stats.rating
                                                    point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time
                                        
                                                    delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
                                                    console.log('325 ' + delivery_chat[chat.id])
                                        
                                                    let buttons_data = []
                                                    if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                                                        buttons_data.push({
                                                            text: sendadress_point[0],
                                                            callback_data: sendadress_point[1]
                                                        })
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                                                        buttons_data.push({
                                                            text: sendphone_point[0],
                                                            callback_data: sendphone_point[1] 
                                                        })
                                                    }
                                        
                                                    let date = new Date()
                                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                                    let timeOfffset = 6 //Astana GMT +6
                                                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
                                        
                                                    let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
                                                    let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
                                                    console.log(time_now.getTime() < restriction_time_min)
                                        
                                                    let ttd_ms = snapshot.val().other_info.stats.delivery_time
                                                    let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                                                    let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                                                    let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
                                        
                                                    ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                                                    ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                                                    ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                                                    let ttd 
                                                    if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                                                        ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                                                    }
                                        
                                                    if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                                                        ttd = ttd_minutes + ' мин.'
                                                    }
                                                    console.log('ttd_hours: ' + ttd_hours)
                                        
                                                    let msgtext = `<b>` + snapshot.val().point_name + `</b>`
                                        
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('1 wrong TIME, time_now: ' + time_now)
                                                        user_deliverdate[chat.id] = 'Как можно раньше'
                                                        msgtext += ` (Закрыто)`
                                                    }
                                                    
                                                    let rating
                                                    if (point_rating[chat.id] < 1){
                                                        rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                                                        rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] > 2){
                                                        rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                                    if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                                                        msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
                                                    }
                                                    if (snapshot.val().other_info.stats.delivery_time > 0) {
                                                        msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                                                    }
                                        
                                                    msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time
                                        
                                                    if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Мин. сумма заказа:</b> ` + delivery_min_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
                                                        msgtext += `
                                                        
` + snapshot.val().other_info.delivery_info.disclaimer
                                                    }
                                                    
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('2 wrong TIME, time_now: ' + time_now)
                                                        msgtext += `
                                        
<b>❗️ Внимание.</b> Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
                                                    }
                                        
                                                    let finalbuttons
                                                    if (snapshot.val().chats.admin !== chat.id){
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        },
                                                        {
                                                            text: loadcategories[0],
                                                            callback_data: loadcategories[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().chats.admin === chat.id){
                                                        isAdmin[chat.id] = true
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        },
                                                        {
                                                            text: openadminpanel[0],
                                                            callback_data: openadminpanel[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                                                        bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                                                            parse_mode: 'HTML',
                                                            caption: msgtext,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        }).then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.caption
                                                        })
                                                        .catch(() => {
                                                            bot.sendMessage(chat.id, msgtext, {
                                                                parse_mode: 'HTML',
                                                                reply_markup: {
                                                                    inline_keyboard: [
                                                                        buttons_data,
                                                                        finalbuttons
                                                                    ]
                                                                }
                                                            })
                                                            .then(res => {
                                                                message_toedit[chat.id][0] = res.message_id
                                                                message_text[chat.id][0] = res.text
                                                            })
                                                        })
                                                    }
                                                    if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                                                        bot.sendMessage(chat.id, msgtext, {
                                                            parse_mode: 'HTML',
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        })
                                                        .then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.text
                                                        })
                                                    }
                                                    
                                                })
                                                message_toedit[chatId][2] = res.message_id
                                            })
                                        }
                                    }
                                    else {
                                        //bot.deleteMessage(chatId, message_toedit[chatId][2])
                                        bot.sendMessage(chatId, 'О нет, Вы не успели. Промокод уже ввели 😢', {
                                            parse_mode: 'HTML'
                                        })
                                        .then(res => {
                                            let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
                                                point_info.get().then((snapshot) => {
                                        
                                                    help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
                                                    point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
                                                    point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
                                                    point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude
                                        
                                                    point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
                                                    point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal
                                        
                                                    delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
                                                    delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
                                                    point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
                                                    point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount
                                        
                                                    point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
                                                    point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
                                                    //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
                                                    point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
                                                    //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]
                                        
                                                    point_rating[chat.id] = snapshot.val().other_info.stats.rating
                                                    point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time
                                        
                                                    delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
                                                    console.log('325 ' + delivery_chat[chat.id])
                                        
                                                    let buttons_data = []
                                                    if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                                                        buttons_data.push({
                                                            text: sendadress_point[0],
                                                            callback_data: sendadress_point[1]
                                                        })
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                                                        buttons_data.push({
                                                            text: sendphone_point[0],
                                                            callback_data: sendphone_point[1] 
                                                        })
                                                    }
                                        
                                                    let date = new Date()
                                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                                    let timeOfffset = 6 //Astana GMT +6
                                                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
                                        
                                                    let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
                                                    let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
                                                    console.log(time_now.getTime() < restriction_time_min)
                                        
                                                    let ttd_ms = snapshot.val().other_info.stats.delivery_time
                                                    let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                                                    let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                                                    let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
                                        
                                                    ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                                                    ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                                                    ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                                                    let ttd 
                                                    if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                                                        ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                                                    }
                                        
                                                    if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                                                        ttd = ttd_minutes + ' мин.'
                                                    }
                                                    console.log('ttd_hours: ' + ttd_hours)
                                        
                                                    let msgtext = `<b>` + snapshot.val().point_name + `</b>`
                                        
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('1 wrong TIME, time_now: ' + time_now)
                                                        user_deliverdate[chat.id] = 'Как можно раньше'
                                                        msgtext += ` (Закрыто)`
                                                    }
                                                    
                                                    let rating
                                                    if (point_rating[chat.id] < 1){
                                                        rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                                                        rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] > 2){
                                                        rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                                    if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                                                        msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
                                                    }
                                                    if (snapshot.val().other_info.stats.delivery_time > 0) {
                                                        msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                                                    }
                                        
                                                    msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time
                                        
                                                    if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Мин. сумма заказа:</b> ` + delivery_min_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
                                                        msgtext += `
                                                        
` + snapshot.val().other_info.delivery_info.disclaimer
                                                    }
                                                    
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('2 wrong TIME, time_now: ' + time_now)
                                                        msgtext += `
                                        
<b>❗️ Внимание.</b> Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
                                                    }
                                        
                                                    let finalbuttons
                                                    if (snapshot.val().chats.admin !== chat.id){
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        }],
                                                        [{
                                                            text: loadcategories[0],
                                                            callback_data: loadcategories[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().chats.admin === chat.id){
                                                        isAdmin[chat.id] = true
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        }],
                                                        [{
                                                            text: openadminpanel[0],
                                                            callback_data: openadminpanel[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                                                        bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                                                            parse_mode: 'HTML',
                                                            caption: msgtext,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        }).then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.caption
                                                        })
                                                        .catch(() => {
                                                            bot.sendMessage(chat.id, msgtext, {
                                                                parse_mode: 'HTML',
                                                                reply_markup: {
                                                                    inline_keyboard: [
                                                                        buttons_data,
                                                                        finalbuttons
                                                                    ]
                                                                }
                                                            })
                                                            .then(res => {
                                                                message_toedit[chat.id][0] = res.message_id
                                                                message_text[chat.id][0] = res.text
                                                            })
                                                        })
                                                    }
                                                    if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                                                        bot.sendMessage(chat.id, msgtext, {
                                                            parse_mode: 'HTML',
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        })
                                                        .then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.text
                                                        })
                                                    }
                                                    
                                                })
                                            message_toedit[chatId][2] = res.message_id
                                        })
                                    }
                                }
                                if (i === coupons.length - 1 && inform[4] !== res.val().name){
                                    bot.deleteMessage(chatId, message_toedit[chatId][2])
                                    bot.sendMessage(chatId, 'Промокод не подходит 😕', {
                                        parse_mode: 'HTML'
                                    })
                                    .then(res => {
                                        let point_info = fb.database().ref('Delivery/' + UserDelCat[chat.id] +'/' + userPoint[chat.id] + '/')
                                                point_info.get().then((snapshot) => {
                                        
                                                    help_phone[chat.id] = snapshot.val().other_info.place_info.contact_phone
                                                    point_adress[chat.id] = snapshot.val().other_info.place_info.adress_text
                                                    point_location[chat.id][0] = snapshot.val().other_info.place_info.latitude
                                                    point_location[chat.id][1] = snapshot.val().other_info.place_info.longitude
                                        
                                                    point_payment_options[chat.id][0] = snapshot.val().other_info.payments.pay_beznal
                                                    point_payment_options[chat.id][1] = snapshot.val().other_info.payments.pay_nal
                                        
                                                    delivery_min_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_min_price
                                                    delivery_price[chat.id] = snapshot.val().other_info.delivery_info.delivery_price
                                                    point_disclaimer[chat.id] = snapshot.val().other_info.delivery_info.disclaimer
                                                    point_pplamount[chat.id] = snapshot.val().other_info.delivery_info.people_amount
                                        
                                                    point_workingtime[chat.id] = snapshot.val().other_info.delivery_info.working_time.split('-')
                                                    point_workingtime[chat.id][0] = point_workingtime[chat.id][0].split(':')
                                                    //point_workingtime[chat.id][0] = [parseInt(point_workingtime[chat.id][0][0]), parseInt(point_workingtime[chat.id][0][1])]
                                                    point_workingtime[chat.id][1] = point_workingtime[chat.id][1].split(':')
                                                    //point_workingtime[chat.id][1] = [parseInt(point_workingtime[chat.id][1][0]), parseInt(point_workingtime[chat.id][1][1])]
                                        
                                                    point_rating[chat.id] = snapshot.val().other_info.stats.rating
                                                    point_delivery_time[chat.id] = snapshot.val().other_info.stats.delivery_time
                                        
                                                    delivery_chat[chat.id] = snapshot.val().chats.delivery_chat
                                                    console.log('325 ' + delivery_chat[chat.id])
                                        
                                                    let buttons_data = []
                                                    if (snapshot.val().other_info.place_info.adress_text !== 'unknown' && snapshot.val().other_info.place_info.adress_text !==undefined && snapshot.val().other_info.place_info.adress_text !== ''){
                                                        buttons_data.push({
                                                            text: sendadress_point[0],
                                                            callback_data: sendadress_point[1]
                                                        })
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.contact_phone !== 'unknown' && snapshot.val().other_info.place_info.contact_phone !==undefined && snapshot.val().other_info.place_info.contact_phone !== ''){
                                                        buttons_data.push({
                                                            text: sendphone_point[0],
                                                            callback_data: sendphone_point[1] 
                                                        })
                                                    }
                                        
                                                    let date = new Date()
                                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                                    let timeOfffset = 6 //Astana GMT +6
                                                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
                                        
                                                    let restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][0][0], point_workingtime[chatId][0][1])
                                                    let restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), point_workingtime[chatId][1][0], point_workingtime[chatId][1][1])
                                                    console.log(time_now.getTime() < restriction_time_min)
                                        
                                                    let ttd_ms = snapshot.val().other_info.stats.delivery_time
                                                    let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                                                    let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                                                    let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
                                        
                                                    ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                                                    ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                                                    ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
                                                    let ttd 
                                                    if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                                                        ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                                                    }
                                        
                                                    if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                                                        ttd = ttd_minutes + ' мин.'
                                                    }
                                                    console.log('ttd_hours: ' + ttd_hours)
                                        
                                                    let msgtext = `<b>` + snapshot.val().point_name + `</b>`
                                        
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('1 wrong TIME, time_now: ' + time_now)
                                                        user_deliverdate[chat.id] = 'Как можно раньше'
                                                        msgtext += ` (Закрыто)`
                                                    }
                                                    
                                                    let rating
                                                    if (point_rating[chat.id] < 1){
                                                        rating = feedback_options[0] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                                                        rating = feedback_options[1] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                        
                                                    if (point_rating[chat.id] > 2){
                                                        rating = feedback_options[2] + ' (' + snapshot.val().other_info.stats.feedbacks_amount + ' отзывов)'
                                                    }
                                                    if (snapshot.val().other_info.stats.feedbacks_amount >= 5){
                                                        msgtext += `
<b>⭐️ Рейтинг:</b> ` + rating
                                                    }
                                                    if (snapshot.val().other_info.stats.delivery_time > 0) {
                                                        msgtext += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                                                    }
                                        
                                                    msgtext += `
<b>🕒 Часы работы:</b> ` + snapshot.val().other_info.delivery_info.working_time
                                        
                                                    if (delivery_min_price[chat.id] !== false && delivery_min_price[chat.id] !== 'unknown' && delivery_min_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Мин. сумма заказа:</b> ` + delivery_min_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (delivery_price[chat.id] !== false && delivery_price[chat.id] !== 'unknown' && delivery_price[chat.id] !== 0){
                                                        msgtext += `
<b>💰 Стоимость доставки:</b> ` + delivery_price[chat.id] + ` тенге.`
                                                    }
                                        
                                                    if (snapshot.val().other_info.delivery_info.disclaimer !== undefined && snapshot.val().other_info.delivery_info.disclaimer !== 'unknown' && snapshot.val().other_info.delivery_info.disclaimer !== '' && snapshot.val().other_info.delivery_info.disclaimer !== 0){
                                                        msgtext += `
                                                        
` + snapshot.val().other_info.delivery_info.disclaimer
                                                    }
                                                    
                                                    if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                                                        console.log('2 wrong TIME, time_now: ' + time_now)
                                                        msgtext += `
                                        
<b>❗️ Внимание.</b> Сделанный Вами заказ в этом месте будет доставлен как только курьерская служба начнет свою работу`
                                                    }
                                        
                                                    let finalbuttons
                                                    if (snapshot.val().chats.admin !== chat.id){
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        }],
                                                        [{
                                                            text: loadcategories[0],
                                                            callback_data: loadcategories[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().chats.admin === chat.id){
                                                        isAdmin[chat.id] = true
                                                        finalbuttons = [{
                                                            text: anotherpoint_text,
                                                            callback_data: anotherpoint_text
                                                        }],
                                                        [{
                                                            text: openadminpanel[0],
                                                            callback_data: openadminpanel[1]
                                                        }]
                                                    }
                                        
                                                    if (snapshot.val().other_info.place_info.photo_url !== false && snapshot.val().other_info.place_info.photo_url !== 'unknown'){
                                                        bot.sendPhoto(chat.id, snapshot.val().other_info.place_info.photo_url, {
                                                            parse_mode: 'HTML',
                                                            caption: msgtext,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        }).then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.caption
                                                        })
                                                        .catch(() => {
                                                            bot.sendMessage(chat.id, msgtext, {
                                                                parse_mode: 'HTML',
                                                                reply_markup: {
                                                                    inline_keyboard: [
                                                                        buttons_data,
                                                                        finalbuttons
                                                                    ]
                                                                }
                                                            })
                                                            .then(res => {
                                                                message_toedit[chat.id][0] = res.message_id
                                                                message_text[chat.id][0] = res.text
                                                            })
                                                        })
                                                    }
                                                    if (snapshot.val().other_info.place_info.photo_url === false || snapshot.val().other_info.place_info.photo_url === 'unknown'){
                                                        bot.sendMessage(chat.id, msgtext, {
                                                            parse_mode: 'HTML',
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    buttons_data,
                                                                    finalbuttons
                                                                ]
                                                            }
                                                        })
                                                        .then(res => {
                                                            message_toedit[chat.id][0] = res.message_id
                                                            message_text[chat.id][0] = res.text
                                                        })
                                                    }
                                                    
                                                })
                                        message_toedit[chatId][2] = res.message_id
                                    })
                                }
                            })
                        }
                    }
                    else {
                        bot.deleteMessage(chatId, message_toedit[chatId][2])
                        bot.sendMessage(chatId, 'Промокод не подходит 😕', {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: '◀️ Назад',
                                        callback_data: mybasket_text
                                    }]
                                ]
                            }
                        })
                        .then(res => {
                            message_toedit[chatId][2] = res.message_id
                        })
                    }
                })
            }
            else {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_hello).then(() => {
                    anotherpoint_multiple[chatId] = 2
                    //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                    bot.sendMessage(chatId, hellomessage_text, {
                        parse_mode: 'HTML',
                    })
                    keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                    //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                    //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
                })
            }
            
        }

        if (text.includes('_forbuyer')){
            bot.deleteMessage(chatId, message_id)

            business_info[chat.id] = []
            business_info[chat.id][0] = 0 //message_id который прилетит мне
            business_info[chat.id][1] = chat.first_name
            if (chat.last_name === undefined){
                business_info[chat.id][2] = 'Не указано'
            }
            if (chat.last_name !== undefined){
                business_info[chat.id][2] = chat.last_name
            }

            if (chat.username === undefined){
                business_info[chat.id][4] = 'Не указано'
            }
            if (chat.username !== undefined){
                business_info[chat.id][4] = chat.username
            }

            
            business_info[chat.id][3] = chat.id

            let first_info = {
                id: business_info[chat.id][3],
                first_name: business_info[chat.id][1],
                last_name: business_info[chat.id][2],
                username: business_info[chat.id][4]
            }
                     
            let updates_first = {}
            updates_first['Motherbase/customers/list/' + chat.id] = first_info
            fb.database().ref().update(updates_first)

            let mb_data = fb.database().ref('Motherbase/')
            mb_data.get().then((result) => {

                business_info[chat.id][6] = result.val().customers.links.media.howitworks
                business_info[chat.id][7] = result.val().customers.links.media.comparison
                business_info[chat.id][8] = result.val().chats.business_id
                business_info[chat.id][9] = result.val().customers.links.media.pricing
                business_info[chat.id][12] = result.val().customers.links.media.videonote

                let txt_me = `🥳 <b>Новый клиент</b>
├ <b>Имя:</b> ` + business_info[chat.id][1] + ' ' + business_info[chat.id][2] + `
└ <b>Username, Id:</b> @` + business_info[chat.id][4] + `, ` + business_info[chat.id][3]
                
                bot.getUserProfilePhotos(chat.id).then(res => {
                    business_info[chat.id][5] = res.photos[0][0].file_id
                    console.log(res.photos[0][0].file_id)
                   
                    bot.sendPhoto(result.val().chats.business_id,  business_info[chat.id][5], {
                        parse_mode: 'HTML',
                        caption: txt_me
                    }).then(res => {
                        message_toedit[chat.id] = []
                        message_toedit[chat.id][15] = res.message_id
                        message_text[chat.id] = []
                        message_text[chat.id][15] = res.caption
                    }) .catch(err => {console.log('here ' + err.name + `\n\n ` + err.message)})
                }).catch(err => {
                    console.log(err)
                    bot.sendMessage(result.val().chats.business_id, txt_me, {
                        parse_mode: 'HTML'
                    })
                    .then(res => {
                        message_toedit[chat.id] = []
                        message_toedit[chat.id][15] = res.message_id
                        message_text[chat.id] = []
                        message_text[chat.id][15] = res.text
                    })
                    .catch(err => {
                        console.log('here ' + err.name + `\n\n ` + err.message)
                    })
                })
                
            })

            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chatId, sticker_hello).then(() => {
                let txt = `👋 Здравствуйте, ` +  chat.first_name + `. Я - Resify, еще один агрегатор доставки. 
Но в отличие от конкурентов, <b>мы не берем % от продажи</b>. За небольшую ежемесячную плату вы сможете организовать онлайн-доставку, увеличить поток клиентов и их удержание`
                bot.sendMessage(chat.id, txt, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Как это работает?',
                                callback_data: business_cbcs[0]
                            }]
                        ]
                    }
                })
            })

            
        }

        else {
            if (buttons_message[chatId] === 0 || UserDelCats[chat.id] === undefined){
                Reset(current_chat)
        
                if (chatId !== delivery_chat[chatId] && text === '/start'){
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, message_id - i).catch(err => {
                            //console.log(err)
                        })
                    }
                    bot.sendSticker(chatId, sticker_hello).then(() => {
                        anotherpoint_multiple[chatId] = 2
                        //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, choosecategory_text, location_text, phone_text)
                        bot.sendMessage(chatId, hellomessage_text, {
                            parse_mode: 'HTML',
                        })
                        keyboards.DeliveryCatKeyboard(delcat_keyboard[chat.id], UserDelCats[chat.id], fb, bot, chat.id, mother_link, choosecat_text, message_toedit[chat.id], message_text[chat.id])
                        //keyboards.PointsKeyboard(points_keyboard[chat.id], userPoints[chat.id], userCity[chat.id], fb, bot, chat.id, change_city_text, choosepoint_text, user_mode[chat.id], sendlocation)
                        //keyboards.CitiesKeyboard(cities_keyboard[chatId], userCities[chatId], fb, bot, chatId, choosecity_text, hellomessage_text)
                    })
                    
                }
                if (chatId === delivery_chat[chatId]){
                    bot.sendMessage(chatId, 'Привет! Я буду скидывать сюда заказы. Чтобы начать выполнять заказ, нажмите на кнопку "✅ Принять", под заказом. Так клиент поймет, что его заказ принят.')
                }
            }
        
            if (buttons_message[chatId] !== 0 && UserDelCats[chat.id] !== undefined) {
                bot.sendMessage(chat.id, 'Вы уверены, что хотите сменить магазин? Ваша корзина опустеет 😟', {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: '◀️ Назад',
                                callback_data: query_deletethismessage
                            }],
                            [{
                                text: reallystartagain[0],
                                callback_data: reallystartagain[1]
                            }]
                        ]
                    }
                })
            }
        }
    }
    else {
        bot.deleteMessage(chatId, message_id)
    }

    
    
})
bot.onText(/\/im_admin/, msg => {
    const { chat, message_id, text } = msg
    let cbadmin_data = fb.database().ref('Delivery/' + UserDelCat[chat.id] + '/' + userPoint[chat.id])
    cbadmin_data.get().then((result) => {
        if (result.val().chats !== undefined){
            if (result.val().chats.admin === chat.id){
                isMailingMessage[chat.id] = 0
                //isChangingPrefs[chat.id] = 0
                isChangingPhone[chat.id] = 0
                isChangingTime[chat.id] = 0
                isChangingDelivery[chat.id] = 0
                isCreatingCoupon[chat.id] = 0
                mailing_text[chat.id] = ''
                
                isAdmin[chat.id] = true
                //message_text[chat.id] = []
                //message_toedit[chat.id] = []
    
                point_rating[chat.id] = result.val().other_info.stats.rating
                point_delivery_time[chat.id] = result.val().other_info.stats.delivery_time
    
                let rating
                if (point_rating[chat.id] < 1){
                    rating = feedback_options[0] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                }
    
                if (point_rating[chat.id] >= 1 && point_rating[chat.id] <= 2){
                    rating = feedback_options[1] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                }
    
                if (point_rating[chat.id] > 2){
                    rating = feedback_options[2] + ' (' + result.val().other_info.stats.feedbacks_amount + ' отзывов)'
                }
    
                let ttd_ms = result.val().other_info.stats.delivery_time
                let ttd_seconds = Math.floor((ttd_ms / 1000) % 60)
                let ttd_minutes = Math.floor((ttd_ms / (1000 * 60)) % 60)
                let ttd_hours = Math.floor((ttd_ms / (1000 * 60 * 60)) % 24)
    
                ttd_hours = (ttd_hours < 10) ? "0" + ttd_hours : ttd_hours;
                ttd_minutes = (ttd_minutes < 10) ? "0" + ttd_minutes : ttd_minutes;
                ttd_seconds = (ttd_seconds < 10) ? "0" + ttd_seconds : ttd_seconds;
    
                let ttd 
                if (ttd_hours !== 00 && ttd_hours !== 0 && ttd_hours !== '00'){
                    ttd = ttd_hours + 'ч. ' + ttd_minutes + ' мин.'
                }
    
                if (ttd_hours === 00 || ttd_hours === 0 || ttd_hours === '00'){
                    ttd = ttd_minutes + ' мин.'
                }
                console.log('ttd_hours: ' + ttd_hours)
    
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                let txt = `Привет! Вы вошли как Администратор <b>` + result.val().point_name + `</b>
`
    
                if (result.val().other_info.stats.feedbacks_amount >= 5){
                    txt += `
<b>⭐️ Ваш рейтинг:</b> ` + rating
                }
                if (result.val().other_info.stats.delivery_time > 0) {
                    txt += `
<b>🚴‍♂️ Скорость доставки:</b> ~` + ttd 
                }
    
                bot.sendMessage(chat.id, txt, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.admin_menu_keyboard
                    }
                })
                .then(res => {
                    message_text[chat.id][6] = res.text
                    message_toedit[chat.id][6] = res.message_id
                })
            }
            else {
                bot.deleteMessage(chat.id, msg.message_id)
                business_info[chat.id] = undefined
                let txty = `Хотите стать партнером Resify? Нажмите на кнопку <b>"О нас"</b> 🤩
Уже являетесь партнером Resify? Просто выберите свое заведение и нажмите "Войти как админ 🛒"`
                bot.sendMessage(chat.id,  txty, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'О нас',
                                callback_data: business_cbcs[7]
                            }],
                            [{
                                text: '⬅️ Назад',
                                callback_data: query_deletethismessage
                            }]
                        ]
                    }
                })
            }
        }
        
        else {
            bot.deleteMessage(chat.id, msg.message_id)
            business_info[chat.id] = undefined
            let txty = `Хотите стать партнером Resify? Нажмите на кнопку <b>"О нас"</b> 🤩
Уже являетесь партнером Resify? Просто выберите свое заведение и нажмите "Войти как админ 🛒"`
                            bot.sendMessage(chat.id,  txty, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'О нас',
                                            callback_data: business_cbcs[7]
                                        }],
                                        [{
                                            text: '⬅️ Назад',
                                            callback_data: query_deletethismessage
                                        }]
                                    ]
                                }
                            })
        }
    })
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
    //user_lastbill[current_chat] = []

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

    temp_message[current_chat] = 0
    userCity[current_chat] = 0 // 0-NurSultan, 1-Almaty
    userPoint[current_chat] = 0
    //
    userCategory[current_chat] = ''
    userCategories[current_chat] = []
    category_keyboard[current_chat] = []
    categories_count[current_chat] = 0
    //
    userFood[current_chat] = ''
    userFoodlist[current_chat] = []
    foodlist_keyboard[current_chat] = []
    foodlist_count[current_chat] = 0
    //
    userCity[current_chat] = ''
    userCities[current_chat] = []
    userPoint[current_chat] = ''
    userPoints[current_chat] = []
    cities_keyboard[current_chat] = []
    points_keyboard[current_chat] = []
    cities_count[current_chat] = 0
    points_count[current_chat] = 0

    isMakingChanges[current_chat] = 0
    isMakingChanges_2[current_chat] = 0
    isMakingChanges_3[current_chat] = 0

    help_phone[current_chat] = 0
    delivery_min_price[current_chat] = 0
    delivery_price[current_chat] = 0
    point_location[current_chat] = []
    point_adress[current_chat] = ''
    point_disclaimer[current_chat] = false
    point_pplamount[current_chat] = false
    point_workingtime[current_chat] = false
    point_payment_options[current_chat] = []
    point_rating[current_chat] = 0
    point_delivery_time[current_chat] = 0

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

    delivery_chat[current_chat] = 0

    delcat_keyboard[current_chat] = []
    UserDelCats[current_chat] = []
    UserDelCat[current_chat] = ''

    message_toedit[current_chat] = []
    message_text[current_chat] = []

    isWritingCoupon[current_chat] = 0
}

process.on('uncaughtException', function (err) {
    console.log(err)
    let userdata = fb.database().ref('Motherbase/logger/uncaughtException/')
    userdata.get().then((result) => {
        let counter = Object.keys(result.val())

        let date = new Date()
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 6 //Astana GMT +6
        let time_now = new Date(utcTime + (3600000 * timeOfffset))

        let updates = {}
        let newreport = {
            who: 'ID:' + current_chat + ', phone: ' + user_phone[current_chat],
            when: time_now,
            point: 'point_name: ' + userPoint[current_chat],
            error_text: err.message.toString(),
            error_stack: err.stack.toString()
        }
        updates['Motherbase/logger/uncaughtException/' + counter.length] = newreport
        fb.database().ref().update(updates)
        let mb_data = fb.database().ref('Motherbase/chats/')
        mb_data.get().then((result) => {
            let err_txt = `<b>⚠️ ВНИМАНИЕ ⚠️</b>
В работе скрипта DELIVERY произошла ошибка.

<b>ℹ️ Общая информация: </b>
├ Заведение: `+ userPoint[current_chat] + `
├ Пользователь: ID: ` + current_chat + `, Телефон: ` + user_phone[current_chat] + `
└ Время: ` + time_now + `

<b>💬 Информация: </b>
` + err.name.toString() + `

` + err.stack.toString() + `

` + err.message.toString()
            bot.sendMessage(result.val().god_id, err_txt, {
                parse_mode: 'HTML'
            })
        })
    
    })
    
})