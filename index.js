const TelegramBot = require('node-telegram-bot-api')
//const mongoose = require('mongoose')
var GeoPoint = require('geopoint')
const debug = require('./helpers')
const config = require('./config')
const database = require('./database.json')
const keyboards = require('./src/keyboard-buttons')
const NodeGeocoder = require('node-geocoder')
//const firebase = require('./firebase_connect')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const { GoogleAuth } = require('google-auth-library');
const creds = require('./src/upperrestaurant-9af5914c14f2.json')
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const gsheets = google.sheets('v4');
console.log('bot has been started...')


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const auth = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    SCOPES
);

listFiles(auth)

function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
});
}
    
//====================INITIALIZE FIREBASE==============================
const firebase_connect = require('firebase')
const { reset } = require('nodemon')
const { captureRejectionSymbol } = require('node-telegram-bot-api')
const { redis } = require('googleapis/build/src/apis/redis')
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
//Google Variables
let guserdata = [] //первое значение - номер строки в таблице
let gusernames = ['Имя', 'Телефон', 'Название абонемента', 'Статус абонемента', 'Дата начала', 'Дата конца', 'Стоимость абонемента' , 'Временное ограничение', 'Посещений осталось', 'Заморозок осталось', 'Начало заморозки']

///////////////////////
// text variables
let admin_id = []
let operators_chat = []
let current_chat = 0
let support_username = []

let temp_message = []
let userCity = [] // 0-NurSultan, 1-Almaty
let userCities = []
let userPoint = []
let userPoints = []
let cities_keyboard = []
let points_keyboard = []
let cities_count = []
let points_count = []
//
let userCategory = []
let userCategories = []
let category_keyboard = []
let categories_count = []
//
let userGyms = []
let gym_keyboard = []
let mother_link = 'https://t.me/ctos_nursultan'
let choosegym_text = 'Выберите спортзал, в котором занимаетесь '
//
let userProgram = []
let userProgrammesList = []
let programmes_keyboard = []
let trener_keyboard = []
let userTreners = []
let userTrener = []
const choosetrener_text = 'Выберите тренера, чтобы узнать о нем больше:'
let foodlist_count = []
//
let shop_keyboard = []
let userShopCategories = []
let chooseshopcategory_text = 'Выберите категорию продукта:'
let userShopCategory = []

let shopitems_keyboard = []
let userItemsList = []
let anothershopcategory_text = '◀️ Другие категории'
let chooseitem_text = 'Выберите товар:'
let userItem = []
let userItemPrice = []
let userlastTraining = []

let waitlist = []

/////////////////////////////////////////////////////////////////
let anotherpoint_multiple = []
let club_name_fb = []

let card_instructions_text = `<b>Почти готово!</b>

❓ Как работает виртуальный абонемент?
После оплаты менеджер выдаст Вам виртуальный абонемент. Вы получите уведомление "Абонемент активирован ✅" с инструкцией к использованию. 
Чтобы начать тренировку в зале, вам нужно либо отсканировать QR-код на ресепшне, либо нажать на кнопку "Начать тренировку" в нижней части экрана. Покажите экран сотруднику клуба и вперед!

💰 Как оплатить абонемент? 
Мы принимаем оплату через KASPI или стандартный перевод на карту. Ниже мы отправили реквизиты, куда необходимо отправить сумму стоимости абонемента. В описании к переводу укажите свое ФИО, которое указали ранее здесь. Так мы поймем, от кого пришли деньги.

После оплаты нажмите на кнопку <b>"☑️ Я оплатил"</b>. Наш менеджер проверит платеж и активирует ваш абонемент.`
/////////////////////////////////////////////////////
let cash_instructions_text = `<b>Почти готово!</b>

❓ Как работает виртуальный абонемент?
После оплаты менеджер выдаст Вам виртуальный абонемент. Вы получите уведомление "Абонемент активирован ✅" с инструкцией к использованию. 
Чтобы начать тренировку в зале, вам нужно либо отсканировать QR-код на ресепшне, либо нажать на кнопку "Начать тренировку" в нижней части экрана. Покажите экран сотруднику клуба и вперед!

💰 Как оплатить наличными? 
Подойдите к сотруднику клуба на ресепшне и скажите, что хотите заплатить безналичными. Покажите ему это сообщение и нажмите на кнопку <b>"☑️ Я оплатил"</b>. Совершите оплату наличными и в течение нескольких секунд сотрудник активирует ваш абонемент. `
const choosepoint_text = 'Выберите заведение, в котором хотите сделать заказ'
const backtoprogramme_text = ['◀️ Назад', 'backtoprogramme_cb']
const backtofillinginfo_text = ['◀️ Назад', 'backtofilling_cb']
const backtochoosepaingmethod_text = ['◀️ Назад', 'backtopme_cb']
const ihavepaid_text = ['☑️ Я оплатил', 'ivepaid_cb']
const accepttraining_text = ['☑️ Подтвердить', 'accpwarng_cb']
const refusetraining_text = ['Назад', 'rfswarng_cb']
const backtotreners_text = ['◀️ Назад к списку', 'backtotreners_cb']
const buyitem_text = ['🟢 Купить этот товар', 'buyitem_clbck']
const backtoitemslist_text = ['◀️ Назад', 'bcktoitemslst_cb']
const dontuseskidka_text = ['Нет, спасибо', 'dontuseskidka_cb']
const useskidka_text = ['Да, хочу!', 'useskidka_cb']
const igotmyitem_text = ['✅ Товар получен','igtmtm_cb']
const continuemyabonement_text = ['🤩 Продлить', 'ctnmabnt_cb']
const freezeabonement1_text = ['❄️ Приостановить абонемент', 'frzabnmt_cb']
const freezeabonement2_text = ['❄️ Приостановить абонемент', 'frzabnmt2_cb']
const unfreezeabonement1_text = ['🧊 Возобновить тренировки', 'unfrzabnmt_cb']
const unfreezeabonement2_text = ['🧊 Возобновить тренировки', 'unfrzabnmt2_cb']
const refuseskidka_text = ['Нет, не хочу', 'rfsskdk_cb']
const adduserdata_text = ['Мой профиль', 'myprf_cb']
const backadduserdata_text = ['◀️ Назад', 'bckaddsrdt_cb']
const adduserinfo_text = ['addusrname_cb', 'addusrphone_cb', 'addusreml_cb']
const backtoadduserinfo_text = ['◀️ Назад', 'bcktddusrnf_cb']
const adminreports = ['📈 Отчеты', 'admreports_cb']
const backfromadmreports = ['◀️ Назад', 'bckfmreprts_cb']
const adminnewreport = ['🟢 Новый отчет', 'admnwrprt_cb']
const howdoyoulikeourtraining_text = 'Ну что, как тренировка? Все ли Вам понравилось? Нам важно знать Ваше мнение ☺️'
const youchosepoint_text = '🛒 Заказать здесь'
const anotherpoint_text = '◀️ Выбрать другое заведение'
const backtomain_text = '◀️ Назад'
const anothercategory_text = '◀️ Выбрать другой тип'
let hellomessage_text = `Привет! Я бот Вашего фитнес-клуба. Со мной Вы можете узнать информацию о клубе и программах занятий, а также купить абонемент`
const youchosecafe_text = 'Вы выбрали кофейню Coffee BOOM, которая находится по адресу: '
const sendlocation = '📍 Отметить на карте'
const choosecategory_text = '<b>Выберите тип тренировки, на которую хотите записаться:</b>'
const chooseprogramme_text = '<b>Выберите программу тренировок:</b>'
const addto_basket_text = '✅ Добавить в корзину'
const changefoodamount_basket_text = '✏️ Изменить количество'
const addto_basket_text2 = 'Готово'
const addto_basket_text3 = 'Готово.'
const dont_addto_basket_text2 = '🗑 Удалить'
const anotherprogram_text = '◀️ Назад к другим программам'
const anotherfood_text2 = '◀️ Назад к списку'
const fillabonement_text = 'Оформить абонемент ▶️'
const chooseamountoffood_text = 'Введите нужное количество: '
const editbasket_text = '✏️ Редактировать корзину'
const paybasket_text = '✅ Сделать заказ'
const youwanttochangepoint_text = 'Вы точно хотите сделать предзаказ в другом заведении? При смене заведения придется выбирать блюда снова'
const query_deletethismessage = 'Нет, не хочу'
const choosefoodtoedit_text = 'Выберите номер блюда, которое нужно отредактировать:'
const delete_basketfood = '🗑  Удалить'
const basketisempty_text = 'Теперь корзина пустая. Давай наполним ее 😏'
const mybasket_text = '🛒 Моя корзина'
const myabonement_status = '🧾 Статус абонемента'
const choosetime_text = 'Через сколько минут Вы хотите получить заказ? (мин. 15 мин)'
const chooseanothertime_text = '⏳ Выбрать другое время'
const paybutton_text = '💳 Оплатить'
const location_text = '📍 Где мы находимся?'
const phone_text = '📞 Позвонить нам'
const didyougetorder_text = 'Вы точно получили свой заказ? Данные о заказе могут не сохраниться'
const yesigotorder_text = 'Да, заказ получен'
const noigotorder_text = 'Я еще не забрал заказ'
const almostthere_text = '🤗 Почти готово! Осталось только указать свой номер и ФИО'
const dataiscorrect_text = '✔️ Продолжить'
const almostthere2_text = 'Готово! Теперь нажми "'+ dataiscorrect_text +'"'
const order_status_button = '🚴‍♂️ Статус заказа'
const coins_text = '💰 Мой баланс'
const start_training_text = '⏱ Начать'
const add_email = '🔗 Добавить email'
const dont_add_email = 'Нет, спасибо'
const spendmycoins = 'Да, хочу'
const dontspendmycoins = 'Нет'
const gotomain_text = '🏠 Главное меню'
const declineorder_button = '❌ Отменить заказ'
let help_phone = []
const didntaddemail_text = '😕 Жаль, что вы не хотите указать свой email. Это еще одна возможность быть в курсе акций и уникальных предложений'
const emailalreadyadded_text = 'Спасибо за то, что выбираете нас! Вы можете сделать заказ еще один заказ: '
const badfeedback_text = '🙁 Нам жаль, что Вы недовольны тренировкой. '
const goodfeedback_text = '👍 Отлично! Мы рады, что вам все понравилось. '
const normfeedback_text = '😐 Странно... Обычно мы следим за тем, чтобы наши тренировки проходили на ура! '
const dopblank_text = `Выберите способ оплаты. 
❗️ Чтобы оплатить наличными нужно в момент оплаты находиться в клубе. В противном случае ваш запрос будет отклонен`
const dataiscorrect2_text = 'Информация введена верно'

const leavecomment = '✏️ Написать отзыв'
const dontleavecomment = 'Завершить заказ'
/////////////////////////////////////////////////////////////////
const openkeyboard_pic = 'https://storage.googleapis.com/upperrestaurant.appspot.com/Standards/howtoopen.jpg'
const sticker_hello = ['CAACAgIAAxkBAAMGYM3C1lBqxud-dg-iowVRkGW414MAAoMBAAIlA1IPWNNtHfsPGS0fBA', 'CAACAgIAAxkBAAIDqWDPepkl_U4La4z9-HJyBBHW-F3NAAKAAQACJQNSD7tHz-822-uaHwQ', 'CAACAgIAAxkBAAIDqmDPer1wMJFpjCOvjVn2mw9Va9ADAAKWAQACJQNSD1GYpaVpXb4FHwQ', 'CAACAgIAAxkBAAIDq2DPesqIO4cmZW7tzYiXN1ig0YSHAAKaAQACJQNSD6tgF3kuPi0sHwQ']
const sticker_success = 'CAACAgIAAxkBAAIG2mDQ-q0bypXtUaXFQsyObqaRI94tAAKHAQACJQNSD-j7MBUjpIIaHwQ'
const sticker_badtraining = 'CAACAgIAAxkBAAIE6mDYW84F1xGzOfhxYCWIu_zLCvBMAAKcAQACJQNSD4NGjRGcwhDcIAQ'
const sticker_goodtraining = 'CAACAgIAAxkBAAIE6WDYW0zgcKm6uDSjr4KJVoBvN7zdAAKFAQACJQNSD2kd7Abd4rJfIAQ'
const sticker_trainstarted = ['CAACAgIAAxkBAAIBmWDUsZ1U1D6NwePHF64U5Gh1un49AAKOAQACJQNSD3nI1sYpbxl6HwQ', 'CAACAgIAAxkBAAIBmmDUsaJq0HuhU4fhmD5vOWybr-cxAAKMAQACJQNSDzEM6U6Q3YWaHwQ', 'CAACAgIAAxkBAAIBm2DUsaV8qxjXEyWG_RANJ2Briw9-AAKQAQACJQNSD00wsDgYgXCMHwQ', 'CAACAgIAAxkBAAIBnGDUsaqphLiapGFRAAHfl65qaXCs8QACmAEAAiUDUg810q4HYxfDhR8E']
const text_notadmin = ['Это был пранк, мы знаем что Вы не админ 🤣', 'Стоп, так Вы же не админ 😟', 'Написано же, кнопка для админа 😡']
/////////////////////////////////////////////////////////////////
let basket = [] //корзина (массив массивов)
let decrease_foodcount = '-'
let increase_foodcount = '+'
let decrease_foodcount2 = '.-.'
let increase_foodcount2 = '.+.'
let temp_foodamount = []
//let food_categories = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
let food_categories = []
let temp_program_types = [] //
let myprogram_type = []
let temp_progtypes_text = [] //
let temp_backet_food = [] //
let finalbasket = [] //
let finalprice = [] //
let finaltime_deelay = ''
let finaltime = new Date()

//food_categories[current_chat] = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
//basket[current_chat] = []

///////////Настройки для системы лояльности///////////
let cashback = []
let max_cashback = []
let min_cashback = []
let min_price = []
let max_pay_percentage = 0
let min_pay_percentage = 0
let percent_foremail = 0
let skidka = [] //[current_chat]

///////////Настройки для рассылки///////////
let cheap_max = 0
let group_buys_amount = 0
let reach_min = 0
let user_mailingdata = []
let mailing_modes = ['sendall_cb', 'sndctgr_cb', 'sndprgrm_cb', 'sndper_cb', 'sndtm_cb']
let mailing_buttons =[ ['🤼‍♂️ Категории', 'mlngcat_cb'], ['🕓 Время дня','mlngtme_cb'], ['📅 Срок посещения', 'mlnprd_cb'], ['◀️ Назад', 'mlngback_cb']]
let mailing_time = [['🌞 Утренние группы', 'mlntmemor_cb'], ['🌚 Вечерние группы', 'mlntnght_cb'], ['◀️ Назад', 'mlngtmebck_cb']]
let isMailingMessage = []
let mailing_text = []
let mailing_mode = []
let mailing_categories = []
const sendmessage_cb = 'sndmlngmsg_cb'
let isAdmin = []
///////////////////Настройки Абонемента/////////////////
let keyboard_admin_cards = [['Номер карты', 'chngdmcrd_cb'], ['ФИО на карте', 'cngmcfio_cb'], ['KASPI Номер','cngkspnmbg_cb'], ['◀️ Назад', 'bcktopll_cb']]
let keyboard_admin_phone = [['Номер телефона ', 'admcntphhlp_cb'], ['Ник в телеграме', 'admncktlg_cb'], ['◀️ Назад', 'bcktopll_cb']]
let keyboard_admin_times = [['Дневное время: ', 'admdaytme_cb'], ['Вечернее время: ', 'admnghttme_cb'], ['◀️ Назад', 'bcktotm_cs']]
let keyboard_admin_location = [['Адрес: ', 'admadrstxt_cb'], ['Координаты: ', 'admadrscrdnt_cb'], ['◀️ Назад', 'bcktolct_cb']]
let keyboard_admin_loyal = [['Кэшбэк за тренировку: ', 'admcshbktran_cb'], ['Мин. сумма оплаты: ', 'armcshbmnvl_cb'], ['◀️ Назад', 'bcktolct_cb'], ['Мин.: ','admcshbckmns_cb'], ['Макс.: ','admcshbckmxs_cb']]
let keyboard_admin_voron = [['😎: ', 'admnsgsskdgd_cb'], ['😐: ', 'admnsgsskdmdl_cb'], ['◀️ Назад', 'bcktolct_cb'], ['🤬: ','admnsgsskdbad_cb'], ['Максимальная скидка: ','admnsgsskdmxs_cb']]

let isChangingPrefs = []
let isChangingPhone = []
let isChangingTime = []
let isChangingLocation = []
let isChangingCashback = []
let isChangingVoron = []
///////////////Данные о пользователе//////////////////
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
let favourite_program = []
let abonements_bought = []
let userstatus = []
let order_name = []
let order_date = []
let abonement_status = []
let programme_pas = []

let user_payingmethod = []
let user_payingmethods = [['Безналичные','payingtocard_callback'], ['Наличные', 'payingcash_callback']]
let user_timescame = []
let user_freezeamount = []

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

let abonement_statuses_text = ['В обработке ⏳', '❄️ Заморожен', '✅ Активен', '❌ Отклонен', '😔 Истек']
let feedback_options = ['🤩 Хорошо', '😌 Средне', '😒 Не понравилось']
let answered_feedback = []
let isAnswered_feedback = []
///////////////////////////////////////////////////////

//////////////////QUERY USER DATA//////////////////////
const changename_text = 'Изменить имя'
const changephone_text = 'Изменить номер'
const changeadress_text = 'Изменить адрес'
let isMakingChanges = []
let isMakingChanges_2 = []
///////////////////////////////////////////////////////

let delivery_min_price = 0
let delivery_price = 0
let point_location = []
let point_adress = []
let morning_time = []
let evening_time = []
let card_data = []
const abonementrequest_sended = '⏳ Аккаунт создан! В скором времени это увидит наш менеджер и активирует его. Обычно это занимает не более суток.'

var userlocation = []
var nearest_place = [] //номер ближайшего заведения(в массиве)
var min_distance = []

//////////////////DATA FOR DELIVERS//////////////////////
let abonement_bill_topic_names = ['🎉 Новый заказ!', '✅ Абонемент создан ', '❌ Заказ отклонен', '🥳 Продление абонемента']
let accept_order_callback = 'acc_n'
let refuse_order_callback = 'ref_n'
let isdelivered_callback = 'del_c'
let choosetype_callback = 'chstpe_'
let abonements_bill = ''
let abonements_bill_topic = ''
let abonemets_bill_client_info = ''
let abonements_bill_order_info = ''
let deliver_bill_finalprice = 0
let deliver_bill_order_details = ''
let accepted_order_name = ''
let deliver_bill_help_info = ''

///////////////////////////////////////////////////////

////////////////////SALES_PREFERENCES////////////////////
let suggestgoodskidka_text = []
let suggestmiddleskidka_text = []
let suggestbadskidka_text = []
let discountvalues = []
let programdiscount = []
////////////////////////////////////////////////////////

////////////////////MESSAGES_COUNTER////////////////////
let add_info_msg = []
let buttons_message = []
let messages_todelete = []
let messages_texts = []
///////////////////////////////////////////////////////
let types_keyboard = []
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
        text: start_training_text
    },{
        text: myabonement_status
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
        text: myabonement_status
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]

unregistered_keyboard[3] = [
    [{
        text: myabonement_status
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
        text: start_training_text
    }],
    [{
        text: gotomain_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]
const deelay = []

function StartMailing(towho, text, chatId) {
    if (towho === mailing_modes[4] + 'morning'){
        let mail = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/time/morning')
        mail.get().then(result => {
            let arr = result.val()
            arr = arr.split(',')
            for(let i = 0; i<arr.length; i++){
                bot.sendMessage(arr[i], text, {
                    parse_mode:'HTML'
                })
                .catch(err => {console.log(err)})
            }
        })
    }
    if (towho === mailing_modes[4] + 'evening'){
        let mail = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/time/evening')
        mail.get().then(result => {
            let arr = result.val()
            arr = arr.split(',')
            for(let i = 0; i<arr.length; i++){
                bot.sendMessage(arr[i], text, {
                    parse_mode:'HTML'
                })
                .catch(err => {console.log(err)})
            }
        })
    }
    if (towho === mailing_modes[0]){
        let mail = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/all')
        mail.get().then(result => {
            let arr = result.val()
            arr = arr.split(',')
            for(let i = 0; i<arr.length; i++){
                bot.sendMessage(arr[i], text, {
                    parse_mode:'HTML'
                })
                .catch(err => {console.log(err)})
            }
        })
    }
    if (towho.includes('period')){
        let tmp = towho.split('period')
        tmp = tmp[1]
        let mail = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/period/' + tmp)
        mail.get().then(result => {
            let arr = result.val()
            arr = arr.split(',')
            for(let i = 0; i<arr.length; i++){
                bot.sendMessage(arr[i], text, {
                    parse_mode:'HTML'
                })
                .catch(err => {console.log(err)})
            }
        })
    }
    if (towho.includes('mailprog_')){
        towho = towho.split('_')
        let category = towho[1]
        let program = towho[2]
        let mail = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + category + '/' + program + '/value')
        mail.get().then(result => {
            let arr = result.val()
            arr = arr.split(',')
            for(let i = 0; i<arr.length; i++){
                bot.sendMessage(arr[i], text, {
                    parse_mode:'HTML'
                })
                .catch(err => {console.log(err)})
            }
        })
    }
}

 //console.log(new Date(1630346400000) + '   |   ' + new Date(1624205621683))
function StartCheckingOrder(chat){
    let order_data = fb.database().ref(order_name[chat] + '/abonement/abonement_status')
    order_data.on('value', (result) => 
    {
        abonement_status[chat] = result.val()
        console.log('ORDER STATUS: ' + result.val() + ', name: "' + order_name[chat] + '"')
        user_mailingdata[current_chat] = []
        if (abonement_status[chat] === abonement_statuses_text[3]){
            programdiscount[chat] = 0
            bot.sendMessage(chat, 'Нам жаль, но мы были вынуждены отклонить Ваш заказ. Если Вы уверены, что произошла ошибка, свяжитесь с нами по телефону: ' + help_phone[chat], {
                reply_markup:{
                    keyboard:[
                        [{
                            text: '🔃 На главную',
                        }]
                    ],
                    resize_keyboard: true
                }
            })

            return
        }
        
        if (abonement_status[chat] === abonement_statuses_text[2]){
            //мы получили заказ. На клаве вместо статус заказа поставить "заказ получен". Также написать сообщение мол ваш заказ был успешно доставлен. Нажмите на кнопку "готово", чтобы получить баллы или заказать еще раз. 
            //После нажатия на кнопку готово, мы очищаем все данные связывающие аккаунт с чеком доставки, чтобы если в чате доставщиков поменяют статус, клиент не получал опевещений. 
            programdiscount[chat] = 0
            user_mailingdata[current_chat] = []
            let ppl_ingroup = fb.database().ref(programme_pas[chat] + '/people_in_group');
            ppl_ingroup.get().then((snapshot) => {
                if (snapshot.exists() && snapshot.val() !== 'unlimited'){
                    let tmp_ar = snapshot.val()
                    tmp_ar = tmp_ar.split('/')
                    tmp_ar = (parseInt(tmp_ar[0]) + 1).toString() + '/' + tmp_ar[1]
                    console.log('ДОБАВЛЯЕМ НОВОГО УЧАСТНИКА ПРОГРАММЫ. ТЕПЕРЬ: tmp_ar')
                    let updates = {}
                    updates[programme_pas[chat] + '/people_in_group'] = tmp_ar
                    fb.database().ref().update(updates)
                }
                else {
                    console.log('ЭТО НЕ ГРУППОВАЯ ТРЕНИРОВКА')
                }
            })

            const temp_text = `✅ Ваш абонемент активирован!
Для того, чтобы начать тренировку, нажмите кнопку <b>` + start_training_text + `. </b>
Удачной тренировки!`
            userstatus[chat] = 'registered'
            bot.sendSticker(chat, sticker_success)
            .then(() => {
                bot.sendMessage(chat, temp_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: start_training_text,
                                callback_data: accepttraining_text[1]
                            },{
                                text: refusetraining_text[0],
                                callback_data: refusetraining_text[1]
                            }]
                        ],
                    }
                })
            })
            
            return
        }
    }
)
}

function StartTraining(chatId, message_id){
    let userdata = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/clients/' + chatId)
    userdata.get().then((result) => 
    {
        let is_refused = false
        let is_denied = false

        let date = new Date()
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 6 //Astana GMT +6
        let time_now = new Date(utcTime + (3600000 * timeOfffset))
        let end_time = new Date(result.val().abonement.end_date)
        
        if (result.val().abonement.abonement_status !== abonement_statuses_text[2] && is_refused === false){
            is_denied = true
            bot.sendMessage(chatId, 'Статус вашего абонемента: ' + result.val().abonement.abonement_status + '. С этим статусом нельзя начать тренировку 🙁', {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ]
                }
            })
        }

        console.log(time_now + ' \\ ' + end_time)
        if (time_now > end_time && is_refused === false){
            console.log('TRUE!')
            is_refused = true

            let minutes = end_time.getMinutes()
            if (minutes < 10) minutes = '0' + minutes
            let hours = end_time.getHours()
            if (hours < 10) hours = '0' + hours
            let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(end_time) + ' ' +  */hours + ':' + minutes + ', ' + end_time.getDate() + '.' + (end_time.getMonth() + 1) + '.' + end_time.getFullYear()

            bot.sendMessage(chatId, 'Срок действия вашего абонемента истек. Он был годен до: ' + visible_date_end + '. Пожалуйста, оформите новый абонемент или продлите существующий', {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ]
                }
            })
        }

        if (result.val().abonement.visits !== 'unlimited' && result.val().abonement.visits < 1 && is_refused === false){
            is_refused = true
            bot.sendMessage(chatId, 'Вы уже посетили максимально возможное число тренировок в этом месяце. Пожалуйста, оформите новый абонемент или продлите существующий', {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ]
                }
            })
        }
        console.log('first, time = ' + result.val().abonement.time + ', time_now: ' +  + time_now.getTime())
        if (result.val().abonement.time !== 'unlimited' && is_refused === false){
            console.log('second')
            let restriction_time_max/*  = time_now */
            let restriction_time_min/*  = time_now */
            if (result.val().abonement.time === 'evening'){
                //restriction_time_min = restriction_time_min.setHours(evening_time[chatId][0][0], evening_time[chatId][0][1])
                //restriction_time_max = restriction_time_max.setHours(evening_time[chatId][1][0], evening_time[chatId][1][1])
                restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), evening_time[chatId][0][0], evening_time[chatId][0][1])
                restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), evening_time[chatId][1][0], evening_time[chatId][1][1])
                console.log('third, time = evening, restriction_time_max: ' + restriction_time_max + ', restriction_time_min: ' + restriction_time_min + ', time_now: ' + time_now.getTime())
                console.log(time_now.getTime() < restriction_time_min )
                if (time_now.getTime() < restriction_time_min || time_now.getTime() > restriction_time_max){
                    console.log('fourth evening, time_now: ' + time_now)
                    //is_refused = true
                    is_denied = true
                    bot.sendMessage(chatId, '🙊 Упс, вы пришли не вовремя... Ваш абонемент активен с ' + evening_time[chatId][0][0] + ':' + evening_time[chatId][0][1] + ' по ' +  evening_time[chatId][1][0] + ':' + evening_time[chatId][1][1], {
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: refusetraining_text[0],
                                    callback_data: refusetraining_text[1]
                                }]
                            ]
                        }
                    })
                }
            }
            if (result.val().abonement.time === 'morning'){
                restriction_time_min = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), morning_time[chatId][0][0], morning_time[chatId][0][1])
                restriction_time_max = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), morning_time[chatId][1][0], morning_time[chatId][1][1])
                console.log('third, time = morning, restriction_time_max: ' + restriction_time_max + ', restriction_time_min: ' + restriction_time_min)
                if (time_now < restriction_time_min || time_now > restriction_time_max){
                    console.log('fourth morning, time_now: ' + time_now)
                    //is_refused = true
                    is_denied = true
                    bot.sendMessage(chatId, '🙊 Упс, вы пришли не вовремя... Ваш абонемент активен с ' + morning_time[chatId][0][0] + ':' + morning_time[chatId][0][1] + ' по ' +  morning_time[chatId][1][0] + ':' + morning_time[chatId][1][1], {
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: refusetraining_text[0],
                                    callback_data: refusetraining_text[1]
                                }]
                            ]
                        }
                    })
                }
            }
        }
        
        if (is_refused === false && is_denied === false){
            let updates = {}
            console.log(time_now.getTime() - userlastTraining[chatId])
            if ((time_now.getTime() - userlastTraining[chatId]) < 10000000){
                bot.sendMessage(chatId, 'Все в порядке, Вы уже тренируетесь! Больше не нужно сканировать QR. Вперед к победам 🥇', {
                    parse_mode: 'HTML'
                })
                .then(() => {
                    fb.database().ref().update(updates)
                    IdentifyUser(chatId, false)
                })
            }
            else {
                userlastTraining[chatId] = time_now.getTime()
                if (result.val().abonement.visits !== 'unlimited'){          
                    updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/abonement/visits'] = result.val().abonement.visits - 1
                    //updates['Basement/clients/CLIENTID/EGO_CHECK'] = order_update
                    updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/coins'] = result.val().coins + cashback[chatId]
                }
                updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/times_came'] = result.val().times_came + 1
                
                if (result.val().abonement.visits === 'unlimited'){
                    let final_skidka = Math.round((cashback[chatId]/4))
                    console.log('округленная скидка: ' + final_skidka)
                    updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/coins'] = result.val().coins +final_skidka
                }
                
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_trainstarted[Math.floor(Math.random() * sticker_trainstarted.length)])
                .then(() => {
                    anotherpoint_multiple[chatId] = 2
                    if (time_now.getFullYear() <= end_time.getFullYear() && time_now.getMonth() === end_time.getMonth() && time_now.getDate() <= end_time.getDate()){
                        if ((end_time.getDate() - time_now.getDate()) <= 3){
                            bot.sendMessage(chatId, 'Тренировка началась! Больше делать ничего не нужно: когда придете снова, просто отсканируйте QR-код на ресепшене. Удачной тренировки!', {
                                parse_mode: 'HTML'
                            })
                            .then(() => {
                                fb.database().ref().update(updates)
                                programme_pas[chatId] = result.val().programme_pas
                                console.log('p_p: ' + programme_pas[chatId])
                                bot.sendMessage(chatId, '❗️ Внимание! Срок действия вашего абонемента подходит к концу. Вы можете продлить абонемент, либо сменить его:', {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard:[
                                            [{
                                                text: backtomain_text,
                                                callback_data: backtomain_text
                                            }]
                                            [{
                                                text: continuemyabonement_text[0],
                                                callback_data: continuemyabonement_text[1]
                                            },
                                            {
                                                text: 'Сменить программу 🏋️‍♂️',
                                                callback_data: keyboards.main_menu_buttons[1][1]
                                            }]
                                        ]
                                    }
                                })
                                //IdentifyUser(chatId, false)
                            })
                        }
    
                        else {
                            bot.sendMessage(chatId, 'Тренировка началась! Больше делать ничего не нужно: когда придете снова, просто отсканируйте QR-код на ресепшене. Удачной тренировки!', {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: keyboards.main_menu_keyboard
                                }
                            })
                            .then(() => {
                                fb.database().ref().update(updates)
                                IdentifyUser(chatId, false)
                            })
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Тренировка началась! Больше делать ничего не нужно: когда придете снова, просто отсканируйте QR-код на ресепшене. Удачной тренировки!', {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: keyboards.main_menu_keyboard
                            }
                        })
                        .then(() => {
                            fb.database().ref().update(updates)
                            IdentifyUser(chatId, false)
                        })
                    }
                })
            }
            
        }

        if (is_refused === true){
            if (result.val().abonement.abonement_status === abonement_statuses_text[2]){
                let group_data = fb.database().ref(result.val().programme_pas + '/people_in_group')
                group_data.get().then((res) => {
                    let updates = {}
                    if(res.exists() && res.val() !== 'unlimited'){

                        let temp_arr = res.val()
                        console.log('temp1: ' + temp_arr)
                        temp_arr = temp_arr.split('/')
                        temp_arr = (parseInt(temp_arr[0]) - 1).toString() + '/' + temp_arr[1]
                        updates[result.val().programme_pas + '/people_in_group'] = temp_arr
                        updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/abonement/abonement_status'] = abonement_statuses_text[4]
                        fb.database().ref().update(updates)
                        console.log('Абонемент закончился. Убираем из списка, temp2: ' + temp_arr)
                   
                    }
                    else {
                        updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/abonement/abonement_status'] = abonement_statuses_text[4]
                        fb.database().ref().update(updates)
                        console.log('Это не групповая тренировка')
                    }

                    guserdata[chatId] = []
                    guserdata[chatId][0] = result.val().userrow
                    guserdata[chatId][1] = abonement_statuses_text[4]
                    GoogleStopUser(chatId, guserdata[chatId])
                })
            }
            
        }
        
    })
}

function CheckUser(userid, username, chatId, message_id){
    
    console.log('checking user: ' + userid + ' ' + username)
    let userdata = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/clients/' + userid)
    userdata.get().then((result) => 
    {
        console.log('Пользователь зарегистрирован. ID: ' + userid + ' ' + result.val().id)
        //user_adress[chatId] = result.val().adress
        //user_email[chatId] = result.val().email
        user_name[chatId] = result.val().name
        user_username[chatId] = result.val().username
        user_phone[chatId] = result.val().phone
        user_id[chatId] = result.val().id
        //alltime_purchases_amount[chatId] = result.val().alltime_purchases_amount[chatId]
        user_coins[chatId] = result.val().coins

        userstatus[chatId] = 'registered'

        bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtoprogramme_text[0],
                        callback_data: backtoprogramme_text[1]
                    }],
                    [{
                        text: 'Имя: ' + user_name[chatId],
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' + user_phone[chatId],
                        callback_data: changephone_text
                    }],
                    [{
                        text: dataiscorrect_text,
                        callback_data: dataiscorrect_text
                    }]
                ]
            }
        }).then(res => {
            add_info_msg[chatId] = message_id + 2
            messages_todelete[chatId][2] = res.message_id
            console.log('savedmessage = ' + add_info_msg[chatId] + ', ' + messages_todelete[chat.id][2])
        }).catch(err => {console.log(err)})

        //StartAnalitycs()

    }).catch(error => {
        console.log('Пользователь не зарегистрирован. ' + error)
        userstatus[chatId] = 'unregistered'
        /*fb.database().ref('Basement/clients/').set({
            userid : {
                adress: 'unknown'
            }
            username: name,
            email: email,
            profile_picture : imageUrl
          });*/
        user_name[chatId] = username
          bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtoprogramme_text[0],
                        callback_data: backtoprogramme_text[1]
                    }],
                    [{
                        text: 'Имя: ' + user_name[chatId],
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' /* + user_phone[chatId] */,
                        callback_data: changephone_text
                    }]
                ]
            }
        }).then(res => {
            add_info_msg[chatId] = message_id + 2 
            messages_todelete[chatId][2] = res.message_id
            console.log('savedmessage = ' + add_info_msg[chatId] + ', ' + message_id)
        }).catch(err => {console.log(err)})

        //StartAnalitycs()
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
                        favourite_program[current_chat]= food_categories[current_chat][i][2]
                        favourite_food_number[current_chat] = food_categories[current_chat][i][1]
                        console.log(i +' 1 Категория ' + food_categories[current_chat][i][0] + ' больше')
                    }
                    if (i === food_categories[current_chat].length - 1){
                        console.log('WINNER: ' + favourite_program[current_chat])
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

function AddMailingData(chatId, is_new){
    if (is_new === true){
        let all = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/all/')
        all.get().then((result) => {
            if (result.exists()){
                /* let arr = result.val().split(',')
                for(let i = 0; i< arr.length; i++){
                    if (i === arr.length - 1 && chatId.toString() !== arr[i]){
                        let updates = {}
                        updates['Fitness/' + club_name_fb[chatId] + '/mailing/all/'] = result.val() + ',' + chatId.toString()
                        console.log(i + ' | user ' + chatId + ' added to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/all/')
                        fb.database().ref().update(updates)
                    }
                } */
                let arr = result.val()
                if (!arr.includes(chatId + ',')){
                    let updates = {}
                    updates['Fitness/' + club_name_fb[chatId] + '/mailing/all/'] = result.val() + ',' + chatId.toString()
                    console.log(' | user ' + chatId + ' added to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/all/')
                    fb.database().ref().update(updates)
                }
            }

            else {
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/mailing/all/'] = chatId.toString()
                console.log(' | user ' + chatId + ' added to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/all/')
                fb.database().ref().update(updates)
            }
            
        })
        let category = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value')
        category.get().then((result) => {
            if (result.exists()){
                /* let arr = result.val().split(',')
                for(let i = 0; i< arr.length; i++){
                    if (i === arr.length - 1 && chatId.toString() !== arr[i]){
                        let updates = {}
                        updates['Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value'] = result.val() + ',' + chatId.toString()
                        console.log(i + ' | user ' + chatId + ' added to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value')
                        fb.database().ref().update(updates)
                    }
                } */
                let arr = result.val()
                if (!arr.includes(chatId + ',')){
                    let updates = {}
                    updates['Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value'] = result.val() + ',' + chatId.toString()
                    console.log(' | user ' + chatId + ' added to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value')
                    fb.database().ref().update(updates)
                }
            }

            else {
                let updates = {}
                
                updates['Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value'] = chatId.toString()
                updates['Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/name'] = myprogram_type[chatId][6]
                console.log(' | user ' + chatId + ' added to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + userCategory[chatId] + '/' + userProgram[chatId] + '/value')
                fb.database().ref().update(updates)
            }
            
        })
        if (myprogram_type[chatId][2] !== 'unlimited'){
            let time = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2])
            time.get().then((result) => {
                if (result.exists()){
                    /* let arr = result.val().split(',')
                    for(let i = 0; i< arr.length; i++){
                        if (i === arr.length - 1 && chatId.toString() !== arr[i]){
                            let updates = {}
                            updates['Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2]] = result.val() + ',' + chatId.toString()
                            console.log(i + ' | user ' + chatId + ' added to mailing time: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2])
                            fb.database().ref().update(updates)
                        }
                    } */
                    let arr = result.val()
                    if (!arr.includes(chatId + ',')){
                        let updates = {}
                        updates['Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2]] = result.val() + ',' + chatId.toString()
                        console.log(' | user ' + chatId + ' added to mailing time: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2])
                        fb.database().ref().update(updates)
                    }
                }
                else {
                    let updates = {}
                    updates['Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2]] = chatId.toString()
                    console.log(' | user ' + chatId + ' added to mailing time: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/time/' + myprogram_type[chatId][2])
                    fb.database().ref().update(updates)
                }
            })
        }
        let period = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0])
        period.get().then((result) => {
            if (result.exists()){
                /* let arr = result.val().split(',')
                for(let i = 0; i< arr.length; i++){
                    if (i === arr.length - 1 && chatId.toString() !== arr[i]){
                        let updates = {}
                        updates['Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0]] = result.val() + ',' + chatId.toString()
                        console.log(i + ' | user ' + chatId + ' added to mailing time: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0])
                        fb.database().ref().update(updates)
                    }
                } */
                let arr = result.val()
                if (!arr.includes(chatId + ',')){
                    let updates = {}
                    updates['Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0]] = result.val() + ',' + chatId.toString()
                    console.log(' | user ' + chatId + ' added to mailing time: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0])
                    fb.database().ref().update(updates)
                }
            }
            else {
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0]] = chatId.toString()
                console.log(' | user ' + chatId + ' added to mailing time: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/period/' + myprogram_type[chatId][0])
                fb.database().ref().update(updates)
            }
        })

    }
}

function DeleteMailingData(chatId){
    console.log('removing from previous mailing... ' + user_mailingdata[chatId][0] + ', ' + user_mailingdata[chatId][1] + ', ' + user_mailingdata[chatId][2] + ', ' + user_mailingdata[chatId][3])
    let category = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + user_mailingdata[chatId][0] + '/' + user_mailingdata[chatId][1])
    category.get().then((result) => {
        if (result.exists()) {
            let arr = result.val()
            if (arr.includes(',' + chatId.toString())){
                arr = arr.replace(',' + chatId.toString(), '')
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + user_mailingdata[chatId][0] + '/' + user_mailingdata[chatId][1]] = arr.toString()
                console.log(' | user ' + chatId + ' removed to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + user_mailingdata[chatId][0] + '/' + user_mailingdata[chatId][1])
                fb.database().ref().update(updates)
            }
        }
    })
    if (user_mailingdata[chatId][2] !== 'unlimited'){
        let time = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/time/' + user_mailingdata[chatId][2])
        time.get().then((result) => {
            if (result.exists()){
                let arr = result.val()
                if (arr.includes(',' + chatId.toString())){
                    arr = arr.replace(',' + chatId.toString(), '')
                    let updates = {}
                    updates['Fitness/' + club_name_fb[chatId] + '/mailing/time/' + user_mailingdata[chatId][2]] = arr.toString()
                    console.log(' | user ' + chatId + ' removed to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/time/' + user_mailingdata[chatId][2])
                    fb.database().ref().update(updates)
                }
            }
            
        })
    }
    let period = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/period/' + user_mailingdata[chatId][3])
    period.get().then((result) => {
        if (result.exists()){
            let arr = result.val()
            if (arr.includes(',' + chatId.toString())){
                arr = arr.replace(',' + chatId.toString(), '')
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/mailing/period/' + user_mailingdata[chatId][3]] = arr.toString()
                console.log(' | user ' + chatId + ' removed to mailing category: ' + 'Fitness/' + club_name_fb[chatId] + '/mailing/period/' + user_mailingdata[chatId][3])
                fb.database().ref().update(updates)
            }
        }
        
    })
}

async function GoogleAddUser(chatId, guserdata){

    let doc = new GoogleSpreadsheet()
    let sheet, fileId, rows
    if (guserdata[12] === undefined){
        console.log('undefined...')
        await doc.useServiceAccountAuth(creds)
    
        // await doc[chatId].useServiceAccountAuth(creds)
        await doc.createNewSpreadsheetDocument({ title: 'БД Клиентов ' + club_name_fb[chatId]})
        .then(async function() {
            doc.loadInfo()
            sheet = doc.sheetsByIndex[0] 
            //sheet.title = 'Клиенты'
            rows = await sheet.getRows()
            fileId = doc.spreadsheetId;
            console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
            drive = google.drive({ version: "v3", auth: auth })
            await drive.permissions.create({
                resource: {
                  type: "anyone",
                  role: "reader",
                },
                fileId: fileId,
                fields: "id",
            })

            await sheet.loadCells('A1:Z1000'); // loads a range of cells
            console.log(sheet.gridProperties);
            console.log(sheet.lastColumnLetter) // total cells, loaded, how many non-empty

            //Создать логотип, инструкции и тд

            let border_theme = {
                style: 'SOLID',
                'colorStyle': {
                    'rgbColor': {
                        'red': 180,
                        'green': 180,
                        'blue': 180,
                    }
                }
            }
            let cellsdark1 = sheet.getCellByA1('A' + (1 + guserdata[11]).toString())
            cellsdark1.backgroundColor = {
                red: 0,
                green: 0.8,
                blue: 0,
            }
            cellsdark1.textFormat = {
                bold: true
            }
            cellsdark1.save()
            let cellsdark2 = sheet.getCellByA1('B' + (1 + guserdata[11]).toString())
            cellsdark2.backgroundColor = {
                red: 0,
                green: 0.8,
                blue: 0,
            }
            cellsdark2.textFormat = {
                bold: true
            }
            cellsdark2.save()
            for (let i=0; i < 11; i++){
                let cell1 = sheet.getCellByA1('A' + (i+1 + guserdata[11]).toString())
                cell1.value = gusernames[i]
                cell1.horizontalAlignment = 'LEFT'
                cell1.borders = {
                    'top': border_theme,
                    'left': border_theme,
                    'right': border_theme,
                    'bottom': border_theme
                }

                let cell2 = sheet.getCellByA1('B' + (i+1 + guserdata[11]).toString())
                cell2.value = guserdata[i]
                cell2.horizontalAlignment = 'RIGHT'
                cell2.borders = {
                    'top': border_theme,
                    'left': border_theme,
                    'right': border_theme,
                    'bottom': border_theme
                }
                if (i === 10){
                    await sheet.saveUpdatedCells(); // save all updates in one call
                }
            }
        })
        
    }

    if (guserdata[12] !== undefined){
        console.log('NOT undefined... ' + guserdata[12])
        doc = new GoogleSpreadsheet(guserdata[12])
        await doc.useServiceAccountAuth(creds)
        .then(() => {
            doc.loadInfo().then(async function() {
                sheet = doc.sheetsByIndex[0] 
                rows = await sheet.getRows()
                console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                //ТУТ НАЧИНАТЬ ЗАПОЛНЯТЬ КЛЕТКИ

                await sheet.loadCells('A1:Z1000'); // loads a range of cells
                console.log(sheet.gridProperties);
                console.log(sheet.lastColumnLetter) // total cells, loaded, how many non-empty
                let border_theme = {
                    style: 'SOLID',
                    'colorStyle': {
                        'rgbColor': {
                            'red': 180,
                            'green': 180,
                            'blue': 180,
                        }
                    }
                }
                let cellsdark1 = sheet.getCellByA1('A' + (1 + guserdata[11]).toString())
                cellsdark1.backgroundColor = {
                    red: 0,
                    green: 0.8,
                    blue: 0,
                }
                cellsdark1.textFormat = {
                    bold: true
                }
                cellsdark1.save()
                let cellsdark2 = sheet.getCellByA1('B' + (1 + guserdata[11]).toString())
                cellsdark2.backgroundColor = {
                    red: 0,
                    green: 0.8,
                    blue: 0,
                }
                cellsdark2.textFormat = {
                    bold: true
                }
                cellsdark2.save()
                for (let i=0; i < 11; i++){
                    let cell1 = sheet.getCellByA1('A' + (i+1 + guserdata[11]).toString())
                    cell1.value = gusernames[i]
                    cell1.horizontalAlignment = 'LEFT'
                    cell1.borders = {
                        'top': border_theme,
                        'left': border_theme,
                        'right': border_theme,
                        'bottom': border_theme
                    }

                    let cell2 = sheet.getCellByA1('B' + (i+1 + guserdata[11]).toString())
                    cell2.value = guserdata[i]
                    cell2.horizontalAlignment = 'RIGHT'
                    cell2.borders = {
                        'top': border_theme,
                        'left': border_theme,
                        'right': border_theme,
                        'bottom': border_theme
                    }
                    if (i === 10){
                        await sheet.saveUpdatedCells(); // save all updates in one call
                    }
                }
            })
            
            
        })
        
    }
} 

async function GoogleFreezeUser(chatId, guserdata){

    let doc = new GoogleSpreadsheet()
    let sheet, rows

    let sh_info = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/analytics/');
    sh_info.get().then(async function(snapshot){
        if (guserdata[0] !== undefined){
            console.log('NOT undefined... ' + guserdata[0])
            doc = new GoogleSpreadsheet(snapshot.val().sh_online)
            await doc.useServiceAccountAuth(creds)
            .then(() => {
                doc.loadInfo().then(async function() {
                    sheet = doc.sheetsByIndex[0] 
                    rows = await sheet.getRows()
                    console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                    //ТУТ НАЧИНАТЬ ЗАПОЛНЯТЬ КЛЕТКИ
    
                    await sheet.loadCells('A1:Z1000'); // loads a range of cells
                    let cellsdark1 = sheet.getCellByA1('A' + guserdata[0])
                    cellsdark1.backgroundColor = {
                        red: 0,
                        green: 0.5,
                        blue: 1,
                    }
                    let cellsdark2 = sheet.getCellByA1('B' + guserdata[0])
                    cellsdark2.backgroundColor = {
                        red: 0,
                        green: 0.5,
                        blue: 1,
                    }
                    let cell_status = sheet.getCellByA1('B' + (guserdata[0] + 3).toString())
                    cell_status.value = guserdata[1]

                    let cell_freezedate = sheet.getCellByA1('B' + (guserdata[0] + 10).toString())
                    cell_freezedate.value = guserdata[2]

                    await sheet.saveUpdatedCells();
                })
                
                
            })
            
        }
    })
} 

async function GoogleUnFreezeUser(chatId, guserdata){

    let doc = new GoogleSpreadsheet()
    let sheet, rows

    let sh_info = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/analytics/');
    sh_info.get().then(async function(snapshot) {
        if (guserdata[0] !== undefined){
            console.log('NOT undefined... ' + guserdata[0])
            doc = new GoogleSpreadsheet(snapshot.val().sh_online)
            await doc.useServiceAccountAuth(creds)
            .then(() => {
                doc.loadInfo().then(async function() {
                    sheet = doc.sheetsByIndex[0] 
                    rows = await sheet.getRows()
                    console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                    //ТУТ НАЧИНАТЬ ЗАПОЛНЯТЬ КЛЕТКИ
    
                    await sheet.loadCells('A1:Z1000'); // loads a range of cells
                    let cellsdark1 = sheet.getCellByA1('A' + guserdata[0])
                    cellsdark1.backgroundColor = {
                        red: 0,
                        green: 0.8,
                        blue: 0,
                    }
                    let cellsdark2 = sheet.getCellByA1('B' + guserdata[0])
                    cellsdark2.backgroundColor = {
                        red: 0,
                        green: 0.8,
                        blue: 0,
                    }
                    let cell_status = sheet.getCellByA1('B' + (guserdata[0] + 3).toString())
                    cell_status.value = guserdata[1]

                    let cell_freezedate = sheet.getCellByA1('B' + (guserdata[0] + 10).toString())
                    cell_freezedate.value = guserdata[2]

                    let cell_freezeleft = sheet.getCellByA1('B' + (guserdata[0] + 9).toString())
                    cell_freezeleft.value = guserdata[3]

                    let cell_newdate = sheet.getCellByA1('B' + (guserdata[0] + 5).toString())
                    cell_newdate.value = guserdata[4]

                    await sheet.saveUpdatedCells();
                })
                
                
            })
            
        }
    })
} 

async function GoogleStopUser(chatId, guserdata){

    let doc = new GoogleSpreadsheet()
    let sheet, rows

    let sh_info = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/analytics/');
    sh_info.get().then(async function(snapshot) {
        if (guserdata[0] !== undefined){
            console.log('NOT undefined... ' + guserdata[0])
            doc = new GoogleSpreadsheet(snapshot.val().sh_online)
            await doc.useServiceAccountAuth(creds)
            .then(() => {
                doc.loadInfo().then(async function() {
                    sheet = doc.sheetsByIndex[0] 
                    rows = await sheet.getRows()
                    console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                    //ТУТ НАЧИНАТЬ ЗАПОЛНЯТЬ КЛЕТКИ
    
                    await sheet.loadCells('A1:Z1000'); // loads a range of cells
                    let cellsdark1 = sheet.getCellByA1('A' + (guserdata[0] + 1).toString())
                    cellsdark1.backgroundColor = {
                        red: 0.8,
                        green: 0,
                        blue: 0,
                    }
                    let cellsdark2 = sheet.getCellByA1('B' + (guserdata[0] + 1).toString())
                    cellsdark2.backgroundColor = {
                        red: 0.8,
                        green: 0,
                        blue: 0,
                    }
                    let cell_status = sheet.getCellByA1('B' + (guserdata[0] + 4).toString())
                    cell_status.value = guserdata[1]

                    await sheet.saveUpdatedCells();
                })
                
                
            })
            
        }
    })
} 

async function GoogleChangePhone(chatId, guserdata){
    console.log('making changes 5')
    let doc = new GoogleSpreadsheet()
    let sheet, rows

    let sh_info = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/analytics/');
    sh_info.get().then(async function(snapshot) {
        console.log('making changes 6')
        if (guserdata[0] !== undefined){
            console.log('NOT undefined... ' + guserdata[0])
            doc = new GoogleSpreadsheet(snapshot.val().sh_online)
            await doc.useServiceAccountAuth(creds)
            .then(() => {
                doc.loadInfo().then(async function() {
                    sheet = doc.sheetsByIndex[0] 
                    rows = await sheet.getRows()
                    console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                    //ТУТ НАЧИНАТЬ ЗАПОЛНЯТЬ КЛЕТКИ
    
                    await sheet.loadCells('A1:Z1000'); // loads a range of cells

                    let cell_status = sheet.getCellByA1('B' + (guserdata[0] + 2).toString())
                    cell_status.value = guserdata[1]

                    await sheet.saveUpdatedCells();
                })
                
                
            })
            
        }
    })
} 

async function GoogleCreateReport(chatId, name){

    let date = new Date()
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = 6 //Astana GMT +6
    let Astana_date_accept = new Date(utcTime + (3600000 * timeOfffset))
    let visible_date_accept = (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()

    let doc = new GoogleSpreadsheet()
    let sheet, fileId, rows
    await doc.useServiceAccountAuth(creds)
    
    // await doc[chatId].useServiceAccountAuth(creds)
    await doc.createNewSpreadsheetDocument(
        { 
            title: 'Отчет за '+ visible_date_accept,
            'spreadsheetTheme': {
                'primaryFontFamily': 'Arial',
                'themeColors': [
                    {
                        'colorType' : 'TEXT',
                        'color': {
                            "rgbColor": {
                                'red': 0,
                                'green':0,
                                'blue':0,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'BACKGROUND',
                        'color': {
                            "rgbColor": {
                                'red': 1,
                                'green':1,
                                'blue':1,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'LINK',
                        'color': {
                            "rgbColor": {
                                'red': 0.7,
                                'green':0.3,
                                'blue':0.8,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'ACCENT1',
                        'color': {
                            "rgbColor": {
                                'red': 0.42,
                                'green':0.66,
                                'blue':0.31,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'ACCENT2',
                        'color': {
                            "rgbColor": {
                                'red': 0.3,
                                'green':0.53,
                                'blue':0.9,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'ACCENT3',
                        'color': {
                            "rgbColor": {
                                'red': 1,
                                'green':0,
                                'blue':0,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'ACCENT4',
                        'color': {
                            "rgbColor": {
                                'red': 0.66,
                                'green':0.8,
                                'blue':0.7,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'ACCENT5',
                        'color': {
                            "rgbColor": {
                                'red': 0.98,
                                'green':0.74,
                                'blue':0.16,
                                'alpha': 1
                              },
                        }
                    },
                    {
                        'colorType' : 'ACCENT6',
                        'color': {
                            "rgbColor": {
                                'red': 0.73,
                                'green':0.83,
                                'blue':1,
                                'alpha': 1
                              },
                        }
                    }
                ]
            }
        })
    .then(async function() {
        await doc.loadInfo().then(async function() {
            sheet = doc.sheetsByIndex[0] 
            //sheet.title = 'Клиенты'
            await sheet.loadCells('A1:Z1000') // loads a range of cells
            .then(async function() {
                let a1 = sheet.getCellByA1('A1')
                a1.value = 0
                await sheet.saveUpdatedCells()
                .then(async function() {
                    rows = await sheet.getRows()
                    fileId = doc.spreadsheetId;
                    console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                    drive = google.drive({ version: "v3", auth: auth })
                    await drive.permissions.create({
                        resource: {
                          type: "anyone",
                          role: "reader",
                        },
                        fileId: fileId,
                        fields: "id",
                    })
                    
                    let copiedoc = new GoogleSpreadsheet('1S1H28SL3Xy1b735jbOpRpNpZUCb5JQrk6oiWJCDIiUM')
                    await copiedoc.useServiceAccountAuth(creds)
                    .then(async function() {
                        await copiedoc.loadInfo().then(async function() {
                            let copiedsheet = copiedoc.sheetsByIndex[0]
                            await copiedsheet.copyToSpreadsheet(fileId).then(async function() {
                                console.log('COPIED')
                                await sheet.delete()
                                sheet = doc.sheetsByIndex[0] 
                                //sheet.title = 'Отчет'

                                let tablelength = []
                                await sheet.loadCells('A1:Z1000').then(async function() {
                                    let cell_whocreated = sheet.getCell(0,1)
                                    cell_whocreated.value = 'отчет создан ' + visible_date_accept + '. Создал ' + name + ' (' + chatId + ')'
                                    await sheet.saveUpdatedCells()
                                })
                                
                                let updates = {}
                                await doc.addSheet({title: 'Исходники (не менять)'})
                                .then(async function() {
                                    let resources_sheet = doc.sheetsByIndex[1] 
                                    await resources_sheet.loadCells('A1:Z1000').then(async function() {
                                        /*let a1 = resources_sheet.getCellByA1('A1')
                                        a1.value = 0
                                        await resources_sheet.saveUpdatedCells() */
                                        
                                        let cell_title1 = resources_sheet.getCell(12,0)
                                        cell_title1.value = 'Аб. доходы'
                                        let cell_topicname1 = resources_sheet.getCell(12,1)
                                        cell_topicname1.value = 'Этот месяц'
                                        let cell_topicname2 = resources_sheet.getCell(12,2)
                                        cell_topicname2.value = 'Прошлый месяц'

                                         let cell_title2 = resources_sheet.getCell(12,4)
                                        cell_title2.value = 'Аб. продажи'
                                        let cell_topicname11 = resources_sheet.getCell(12,5)
                                        cell_topicname11.value = 'Этот месяц'
                                        let cell_topicname22 = resources_sheet.getCell(12,6)
                                        cell_topicname22.value = 'Прошлый месяц'

                                        let cell_title3 = resources_sheet.getCell(12,8)
                                        cell_title3.value = 'Тов. доходы'
                                        let cell_topicname111 = resources_sheet.getCell(12,9)
                                        cell_topicname111.value = 'Этот месяц'
                                        let cell_topicname222 = resources_sheet.getCell(12,10)
                                        cell_topicname222.value = 'Прошлый месяц'

                                        let cell_title4 = resources_sheet.getCell(12,12)
                                        cell_title4.value = 'Тов. продажи'
                                        let cell_topicname1111 = resources_sheet.getCell(12,13)
                                        cell_topicname1111.value = 'Этот месяц'
                                        let cell_topicname2222 = resources_sheet.getCell(12,14)
                                        cell_topicname2222.value = 'Прошлый месяц'

                                        let counttosave = 0
                                        
                                        let abonements_1 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/income/abonements/')
                                        abonements_1.get().then(async ab_res_now => {
                                            let programs = Object.keys(ab_res_now.val())
                                            let mainsheet = doc.sheetsByIndex[0]
                                            await mainsheet.loadCells('A1:Z1000').then(async function() {
                                                let abonements_income_cell =  mainsheet.getCellByA1('D21')
                                                abonements_income_cell.value = ab_res_now.val().abonements_income
                        
                                                let abonements_sold_cell = mainsheet.getCellByA1('D53')
                                                abonements_sold_cell.value = ab_res_now.val().abonements_sold
                                                let counter = 12
                                                tablelength[0] = programs.length
                                                for (let i = 0; i < programs.length; i++){
                                                    let abonements_2 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/income/abonements/' + programs[i])
                                                    abonements_2.get().then(async ab_res_now_2 => {
                                                        if (ab_res_now_2.val().name !== undefined){
                                                            let cell_name = resources_sheet.getCellByA1('A' + (counter+2))
                                                            cell_name.value = ab_res_now_2.val().name
                        
                                                            let cell_val = resources_sheet.getCellByA1('B' + (counter+2))
                                                            cell_val.value = ab_res_now_2.val().income
                                                            cell_val.valueType = 'CURRENCY'

                                                            let cell_sold_name = resources_sheet.getCellByA1('E' + (counter+2))
                                                            cell_sold_name.value = ab_res_now_2.val().name
                        
                                                            let cell_sold = resources_sheet.getCellByA1('F' + (counter+2))
                                                            cell_sold.value = ab_res_now_2.val().sold
                                                            counter++
                                                            
                                                        }

                                                        if (i === programs.length - 1){
                                                            await mainsheet.saveUpdatedCells()
                                                            await resources_sheet.saveUpdatedCells()
                                                            .then(()=>{
                                                                counttosave++
                                                                if (counttosave === 4){
                                                                    fb.database().ref().update(updates)
                                                                    console.log('SAVED!')
                                                                }
                                                            })
                                                            
                                                            
                                                        }
                                                    })
                                                }
                                            })
                    
                                            
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let abonements_22 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/reports/17_07_21/data/income/abonements/')
                                        abonements_22.get().then(async ab_res_now => {
                                            let programs = Object.keys(ab_res_now.val())
                                            let mainsheet = doc.sheetsByIndex[0]
                    
                                            await mainsheet.loadCells('A1:Z1000').then(async function() {
                                                let abonements_income_cell =  mainsheet.getCellByA1('I21')
                                                abonements_income_cell.value = ab_res_now.val().abonements_income
                        
                                                let abonements_sold_cell = mainsheet.getCellByA1('I53')
                                                abonements_sold_cell.value = ab_res_now.val().abonements_sold
                        
                                                let counter = 12
                                                for (let i = 0; i < programs.length; i++){
                                                    let abonements_2 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/reports/17_07_21/data/income/abonements/' + programs[i])
                                                    abonements_2.get().then(async ab_res_now_2 => {
                                                        if (ab_res_now_2.val().name !== undefined){
                        
                                                            let cell_val = resources_sheet.getCellByA1('C' + (counter+2))
                                                            cell_val.value = ab_res_now_2.val().income
                        
                                                            let cell_sold = resources_sheet.getCellByA1('G' + (counter+2))
                                                            cell_sold.value = ab_res_now_2.val().sold
                                                            counter++
                        
                                                            
                                                        }

                                                        if (i === programs.length - 1){
                                                            await mainsheet.saveUpdatedCells()
                                                            await resources_sheet.saveUpdatedCells()
                                                            .then(()=>{
                                                                counttosave++
                                                                if (counttosave === 4){
                                                                    fb.database().ref().update(updates)
                                                                    console.log('SAVED!')
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                    
                                            
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let items_1 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/income/items/')
                                        items_1.get().then(async ab_res_now => {
                                            let programs = Object.keys(ab_res_now.val())
                                            let mainsheet = doc.sheetsByIndex[0]
                                            await mainsheet.loadCells('A1:Z1000').then(async function() {
                                                let items_income_cell =  mainsheet.getCellByA1('D22')
                                                items_income_cell.value = ab_res_now.val().items_income
                                                tablelength[1] = programs.length
                                                let items_sold_cell = mainsheet.getCellByA1('D54')
                                                items_sold_cell.value = ab_res_now.val().items_sold
                                                let counter = 12
                                                for (let i = 0; i < programs.length; i++){
                                                    let items_2 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/income/items/' + programs[i])
                                                    items_2.get().then(async it_res_now_2 => {
                                                        if (it_res_now_2.val().name !== undefined){
                                                            let cell_name = resources_sheet.getCellByA1('I' + (counter+2))
                                                            cell_name.value = it_res_now_2.val().name
                        
                                                            let cell_val = resources_sheet.getCellByA1('J' + (counter+2))
                                                            cell_val.value = it_res_now_2.val().income
                        
                                                            let cell_sold_name = resources_sheet.getCellByA1('M' + (counter+2))
                                                            cell_sold_name.value = it_res_now_2.val().name
                        
                                                            let cell_sold = resources_sheet.getCellByA1('N' + (counter+2))
                                                            cell_sold.value = it_res_now_2.val().sold
                                                            counter++
                        
                                                            
                                                        }

                                                        if (i === programs.length - 1){
                                                            await mainsheet.saveUpdatedCells()
                                                            await resources_sheet.saveUpdatedCells()
                                                            .then(()=>{
                                                                counttosave++
                                                                if (counttosave === 4){
                                                                    fb.database().ref().update(updates)
                                                                    console.log('SAVED!')
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                            
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let items_22 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/reports/17_07_21/data/income/items/')
                                        items_22.get().then(async ab_res_now => {
                                            let programs = Object.keys(ab_res_now.val())
                                            let mainsheet = doc.sheetsByIndex[0]
                                            await mainsheet.loadCells('A1:Z1000').then(async function() {
                                                let items_income_cell =  mainsheet.getCellByA1('I22')
                                                items_income_cell.value = ab_res_now.val().items_income
                        
                                                let items_sold_cell = mainsheet.getCellByA1('I54')
                                                items_sold_cell.value = ab_res_now.val().items_sold
                        
                                                let counter = 12
                                                for (let i = 0; i < programs.length; i++){
                                                    let items_2 = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/reports/17_07_21/data/income/items/' + programs[i])
                                                    items_2.get().then(async item_res_now_2 => {
                                                        if (item_res_now_2.val().name !== undefined){
                        
                                                            let cell_val = resources_sheet.getCellByA1('K' + (counter+2))
                                                            cell_val.value = item_res_now_2.val().income
                        
                                                            let cell_sold = resources_sheet.getCellByA1('O' + (counter+2))
                                                            cell_sold.value = item_res_now_2.val().sold
                                                            counter++
                        
                                                            
                                                        }

                                                        if (i === programs.length - 1){
                                                            await mainsheet.saveUpdatedCells()
                                                            await resources_sheet.saveUpdatedCells()
                                                            .then(()=>{
                                                                counttosave++
                                                                if (counttosave === 4){
                                                                    fb.database().ref().update(updates)
                                                                    console.log('SAVED!')
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                            
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let statss = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/audience/stats/')
                                        statss.get().then(async ans => {
                    
                                            let all =  resources_sheet.getCellByA1('A1')
                                            all.value = 'Всего'
                    
                                            let active =  resources_sheet.getCellByA1('B1')
                                            active.value = 'Активные'
                    
                                            let freezed =  resources_sheet.getCellByA1('C1')
                                            freezed.value = 'В заморозке'
                    
                                            let inactive =  resources_sheet.getCellByA1('D1')
                                            inactive.value = 'Неактивные'
                    
                                            let all_1 =  resources_sheet.getCellByA1('A2')
                                            all_1.value = ans.val().net_users
                    
                                            let active_1 =  resources_sheet.getCellByA1('B2')
                                            active_1.value = ans.val().active
                    
                                            let freezed_1 =  resources_sheet.getCellByA1('C2')
                                            freezed_1.value = ans.val().freeze
                    
                                            let inactive_1 =  resources_sheet.getCellByA1('D2')
                                            inactive_1.value = ans.val().inactive
                    
                                            await resources_sheet.saveUpdatedCells()
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let conversions = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/audience/conversions/')
                                        conversions.get().then(async ans => {
                                            let all =  resources_sheet.getCellByA1('A4')
                                            all.value = 'Всего'
                    
                                            let active =  resources_sheet.getCellByA1('B4')
                                            active.value = 'Конверсии'

                                            let activee =  resources_sheet.getCellByA1('A5')
                                            activee.value = ans.val().onetime

                                            let activeee =  resources_sheet.getCellByA1('B5')
                                            activeee.value = ans.val().converted
                    
                                            await resources_sheet.saveUpdatedCells().catch(err => {
                                                console.log('2 ' + err)
                                            })
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let feedback = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/current_data/audience/conversions/feedback')
                                        feedback.get().then(async ans => {
                    
                                            let all =  resources_sheet.getCellByA1('A7')
                                            all.value = '🤩'
                    
                                            let active =  resources_sheet.getCellByA1('B7')
                                            active.value = '😐'
                    
                                            let freezed =  resources_sheet.getCellByA1('C7')
                                            freezed.value = '😡'
                    
                                            let all_1 =  resources_sheet.getCellByA1('A8')
                                            all_1.value = ans.val().bad
                    
                                            let active_1 =  resources_sheet.getCellByA1('B8')
                                            active_1.value = ans.val().good
                    
                                            let freezed_1 =  resources_sheet.getCellByA1('C8')
                                            freezed_1.value = ans.val().middle
                    
                                            await resources_sheet.saveUpdatedCells()
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })
                    
                                        let net_value = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/analytics/alltime_data/')
                                        net_value.get().then(async ans => {
                                            let mainsheet = doc.sheetsByIndex[0]
                    
                                            await mainsheet.loadCells('A1:Z1000').then(async function() {
                                                let all =  mainsheet.getCellByA1('G14')
                                                all.value = ans.val().net_sold
                        
                                                let active =  mainsheet.getCellByA1('H14')
                                                active.value = ans.val().net_income
                        
                                                let freezed =  mainsheet.getCellByA1('I14')
                                                freezed.value = ans.val().net_conversions + ' человек(-а)'
                        
                                                await mainsheet.saveUpdatedCells().catch(err => {
                                                    console.log('3 ' + err)
                                                })
                                            }).catch(err => {
                                                console.log('2 ' + err)
                                            })
                    
                                            
                                        }).catch(err => {
                                            console.log('1 ' + err)
                                        })

                                        let tablesize = [800, 220]
                                        let chart_request = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                    "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            "title": "Абонементы",
                                                            "titleTextPosition": {
                                                                "horizontalAlignment": 'LEFT'
                                                            },
                                                            "basicChart": {
                                                              "chartType": "COLUMN",
                                                              "legendPosition": "TOP_LEGEND",
                                                              "domains": [ //НАЗВАНИЯ
                                                                {
                                                                  "domain": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12, //13?
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 0,
                                                                          "endColumnIndex": 1
                                                                        }
                                                                      ]
                                                                    }
                                                                  }
                                                                }
                                                              ],
                                                              "series": [ //ЗНАЧЕНИЯ
                                                                {
                                                                  "series": { //ПЕРВОЕ ЗНАЧЕНИЕ, ПЕРВЫЙ ЦВЕТ КВАДРАТИКА
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 1,
                                                                          "endColumnIndex": 2
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  /* "colorStyle": {
                                                                    "themeColor": "ACCENT1"
                                                                  } */
                                                                  'color': {
                                                                    'red': 0.42,
                                                                        'green':0.66,
                                                                        'blue':0.31,
                                                                        'alpha': 1
                                                                }
                                                                },
                                                                {
                                                                  "series": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 2,
                                                                          "endColumnIndex": 3
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  'color': {
                                                                    'red': 0.42,
                                                                        'green':0.66,
                                                                        'blue':0.31,
                                                                        'alpha': 1
                                                                }
                                                                },
                                                              ],
                                                              "headerCount": 1
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 24,
                                                                    "columnIndex": 1
                                                                },
                                                                "widthPixels": tablesize[0],
                                                                "heightPixels": tablesize[1]
                                                            }
                                                          }
                                                        }
                                                      },
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
    
                                        let chart_request_2 = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                      "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            "title": "Товары",
                                                            "titleTextPosition": {
                                                                "horizontalAlignment": 'LEFT'
                                                            },
                                                            "basicChart": {
                                                              "chartType": "COLUMN",
                                                              "legendPosition": "TOP_LEGEND",
                                                              "domains": [ //НАЗВАНИЯ
                                                                {
                                                                  "domain": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12, //13?
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 8,
                                                                          "endColumnIndex": 9
                                                                        }
                                                                      ]
                                                                    }
                                                                  }
                                                                }
                                                              ],
                                                              "series": [ //ЗНАЧЕНИЯ
                                                                {
                                                                  "series": { //ПЕРВОЕ ЗНАЧЕНИЕ, ПЕРВЫЙ ЦВЕТ КВАДРАТИКА
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 9,
                                                                          "endColumnIndex": 10
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  'color': {
                                                                    'red': 0.42,
                                                                        'green':0.66,
                                                                        'blue':0.31,
                                                                        'alpha': 1
                                                                }
                                                                },
                                                                {
                                                                  "series": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 10,
                                                                          "endColumnIndex": 11
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  'color': {
                                                                    'red': 0.42,
                                                                        'green':0.66,
                                                                        'blue':0.31,
                                                                        'alpha': 1
                                                                }
                                                                },
                                                              ],
                                                              "headerCount": 1
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 35,
                                                                    "columnIndex": 1
                                                                },
                                                                "widthPixels": tablesize[0],
                                                                "heightPixels": tablesize[1]
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
    
                                        let chart_request_3 = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                      "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            "title": "Абонементы",
                                                            "titleTextPosition": {
                                                                "horizontalAlignment": 'LEFT'
                                                            },
                                                            "basicChart": {
                                                              "chartType": "COLUMN",
                                                              "legendPosition": "TOP_LEGEND",
                                                              "domains": [ //НАЗВАНИЯ
                                                                {
                                                                  "domain": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12, //13?
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 4,
                                                                          "endColumnIndex": 5
                                                                        }
                                                                      ]
                                                                    }
                                                                  }
                                                                }
                                                              ],
                                                              "series": [ //ЗНАЧЕНИЯ
                                                                {
                                                                  "series": { //ПЕРВОЕ ЗНАЧЕНИЕ, ПЕРВЫЙ ЦВЕТ КВАДРАТИКА
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 5,
                                                                          "endColumnIndex": 6
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT2"
                                                                  }
                                                                },
                                                                {
                                                                  "series": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 6,
                                                                          "endColumnIndex": 7
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT6"
                                                                  }
                                                                },
                                                              ],
                                                              "headerCount": 1
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 56,
                                                                    "columnIndex": 1
                                                                },
                                                                "widthPixels": tablesize[0],
                                                                "heightPixels": tablesize[1]
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
    
                                        let chart_request_4 = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                      "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            "title": "Товары",
                                                            "titleTextPosition": {
                                                                "horizontalAlignment": 'LEFT'
                                                            },
                                                            "basicChart": {
                                                              "chartType": "COLUMN",
                                                              "legendPosition": "TOP_LEGEND",
                                                              "domains": [ //НАЗВАНИЯ
                                                                {
                                                                  "domain": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12, //13?
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 12,
                                                                          "endColumnIndex": 13
                                                                        }
                                                                      ]
                                                                    }
                                                                  }
                                                                }
                                                              ],
                                                              "series": [ //ЗНАЧЕНИЯ
                                                                {
                                                                  "series": { //ПЕРВОЕ ЗНАЧЕНИЕ, ПЕРВЫЙ ЦВЕТ КВАДРАТИКА
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 13,
                                                                          "endColumnIndex": 14
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT2"
                                                                  }
                                                                  
                                                                },
                                                                {
                                                                  "series": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 12,
                                                                          "endRowIndex": tablelength[0] + 1,
                                                                          "startColumnIndex": 14,
                                                                          "endColumnIndex": 15
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT6"
                                                                  }
                                                                },
                                                              ],
                                                              "headerCount": 1
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 68,
                                                                    "columnIndex": 1
                                                                },
                                                                "offsetYPixels": -20,
                                                                "widthPixels": tablesize[0],
                                                                "heightPixels": tablesize[1]
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
    
                                        let chart_request_5 = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                      "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            /* "title": "Товары",
                                                            "titleTextPosition": {
                                                                "horizontalAlignment": 'LEFT'
                                                            }, */
                                                            "basicChart": {
                                                              "chartType": "COLUMN",
                                                              "legendPosition": "TOP_LEGEND",
                                                              /* "domains": [ //НАЗВАНИЯ
                                                                {
                                                                  "domain": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 3, //13?
                                                                          "endRowIndex": 4,
                                                                          "startColumnIndex": 0,
                                                                          "endColumnIndex": 2
                                                                        }
                                                                      ]
                                                                    }
                                                                  }
                                                                }
                                                              ], */
                                                              "series": [ //ЗНАЧЕНИЯ
                                                                {
                                                                  "series": { //ПЕРВОЕ ЗНАЧЕНИЕ, ПЕРВЫЙ ЦВЕТ КВАДРАТИКА
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 3,
                                                                          "endRowIndex": 5,
                                                                          "startColumnIndex": 0,
                                                                          "endColumnIndex": 1
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT6"
                                                                  }
                                                                },
                                                                {
                                                                  "series": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 3,
                                                                          "endRowIndex": 5,
                                                                          "startColumnIndex": 1,
                                                                          "endColumnIndex": 2
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "LEFT_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT2"
                                                                  }
                                                                },
                                                              ],
                                                              "headerCount": 1,
                                                              //"stackedType": 'PERCENT_STACKED',
                                                              /* "totalDataLabel": {
                                                                "type": 'DATA',
                                                                "textFormat": {
                                                                    'bold' : true
                                                                },
                                                                //"placement" : 'INSIDE_END',
                                                              } */
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 97,
                                                                    "columnIndex": 1
                                                                },
                                                                "offsetYPixels": -30,
                                                                "widthPixels": 200,
                                                                "heightPixels": 250
                                                            }
                                                          },
                                                          
                                                        }
                                                      }
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
    
                                        let chart_request_6 = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                      "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            "title": "Отзывы новых клиентов",
                                                            "titleTextPosition": {
                                                                "horizontalAlignment": 'LEFT'
                                                            },
                                                            "basicChart": {
                                                              "chartType": "BAR",
                                                              "legendPosition": "LEFT_LEGEND",
                                                              /* "domains": [ //НАЗВАНИЯ
                                                                {
                                                                  "domain": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 3, //13?
                                                                          "endRowIndex": 4,
                                                                          "startColumnIndex": 0,
                                                                          "endColumnIndex": 2
                                                                        }
                                                                      ]
                                                                    }
                                                                  }
                                                                }
                                                              ], */
                                                              "series": [ //ЗНАЧЕНИЯ
                                                                {
                                                                  "series": { //ПЕРВОЕ ЗНАЧЕНИЕ, ПЕРВЫЙ ЦВЕТ КВАДРАТИКА
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 6,
                                                                          "endRowIndex": 8,
                                                                          "startColumnIndex": 0,
                                                                          "endColumnIndex": 1
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "BOTTOM_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT1"
                                                                  }
                                                                },
                                                                {
                                                                  "series": {
                                                                    "sourceRange": {
                                                                      "sources": [
                                                                        {
                                                                          "sheetId": resources_sheet.sheetId,
                                                                          "startRowIndex": 6,
                                                                          "endRowIndex": 8,
                                                                          "startColumnIndex": 1,
                                                                          "endColumnIndex": 2
                                                                        }
                                                                      ]
                                                                    }
                                                                  },
                                                                  "targetAxis": "BOTTOM_AXIS",
                                                                  "colorStyle": {
                                                                    "themeColor": "ACCENT5"
                                                                  }
                                                                },
                                                                {
                                                                    "series": {
                                                                      "sourceRange": {
                                                                        "sources": [
                                                                          {
                                                                            "sheetId": resources_sheet.sheetId,
                                                                            "startRowIndex": 6,
                                                                            "endRowIndex": 8,
                                                                            "startColumnIndex": 2,
                                                                            "endColumnIndex": 3
                                                                          }
                                                                        ]
                                                                      }
                                                                    },
                                                                    "targetAxis": "BOTTOM_AXIS",
                                                                    "colorStyle": {
                                                                        "themeColor": "ACCENT3"
                                                                      }
                                                                  },
                                                              ],
                                                              "headerCount": 1,
                                                              /* "totalDataLabel": {
                                                                "type": 'DATA',
                                                                "textFormat": {
                                                                    'bold' : true
                                                                },
                                                                //"placement" : 'INSIDE_END',
                                                              } */
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 97,
                                                                    "columnIndex": 4
                                                                },
                                                                "offsetXPixels": -80,
                                                                "offsetYPixels": -30,
                                                                "widthPixels": 575,
                                                                "heightPixels": 250
                                                            }
                                                          },
                                                        }
                                                      }
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
    
                                        let chart_request_pie1 = {
                                            'spreadsheetId': doc.spreadsheetId,
                                            'resource': {
                                                "requests": [
                                                    {
                                                      "addChart": {
                                                        "chart": {
                                                          "spec": {
                                                            "backgroundColorStyle": {
                                                                'rgbColor': {
                                                                    'red': 0.95,
                                                                    'green': 0.95,
                                                                    'blue': 0.95,
                                                                }
                                                            },
                                                            "pieChart": {
                                                              "domain": {
                                                                "sourceRange": {
                                                                  "sources": [
                                                                    {
                                                                      "sheetId": resources_sheet.sheetId,
                                                                      "startRowIndex": 0,
                                                                      "endRowIndex": 1,
                                                                      "startColumnIndex": 1,
                                                                      "endColumnIndex": 4
                                                                    }
                                                                  ]
                                                                }
                                                              },
                                                              "series": {
                                                                "sourceRange": {
                                                                  "sources": [
                                                                    {
                                                                      "sheetId": resources_sheet.sheetId,
                                                                      "startRowIndex": 1,
                                                                      "endRowIndex": 2,
                                                                      "startColumnIndex": 1,
                                                                      "endColumnIndex": 4
                                                                    }
                                                                  ]
                                                                }
                                                              },
                                                            }
                                                          },
                                                          "position": {
                                                            "overlayPosition": {
                                                                "anchorCell": {
                                                                    "sheetId": sheet.sheetId,
                                                                    "rowIndex": 83,
                                                                    "columnIndex": 5
                                                                },
                                                                "offsetXPixels": 5,
                                                                "offsetYPixels": -20,
                                                                "widthPixels": 400,
                                                                "heightPixels": 220
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  ]
                                            },
                                            'auth': auth
                                        }
                                        
                                        const responce = (await gsheets.spreadsheets.batchUpdate(chart_request)).data
                                        const responce2 = (await gsheets.spreadsheets.batchUpdate(chart_request_2)).data
                                        const responce3 = (await gsheets.spreadsheets.batchUpdate(chart_request_3)).data
                                        const responce4 = (await gsheets.spreadsheets.batchUpdate(chart_request_4)).data
                                        const responce5 = (await gsheets.spreadsheets.batchUpdate(chart_request_5)).data
                                        const responce6 = (await gsheets.spreadsheets.batchUpdate(chart_request_6)).data
                                        await gsheets.spreadsheets.batchUpdate(chart_request_pie1).then(() => {
                                            Astana_date_accept
                                            updates['Fitness/'+club_name_fb[chatId]+'/analytics/last_report_date'] = Astana_date_accept.getTime()
                                            
                                            var newdata = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/analytics/current_data')
                                            newdata.get().then((sn_1) => {
                                                let newreport = sn_1.val()
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/reports/'+ Astana_date_accept.getTime() + '/data'] = newreport
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/reports/'+ Astana_date_accept.getTime() + '/link'] = 'https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId
                                                console.log('https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId)
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/reports/'+ Astana_date_accept.getTime() + '/name'] = 'Отчет ' + visible_date_accept
    
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/audience/conversions/converted'] = 0
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/audience/conversions/onetime'] = 0
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/audience/conversions/feedback/good'] = 0
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/audience/conversions/feedback/middle'] = 0
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/audience/conversions/feedback/bad'] = 0
                                            
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/income/net_income'] = 0
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/income/net_sold'] = 0
    
                                                let free_abonements = {
                                                    abonements_income: 0,
                                                    abonements_sold: 0
                                                }
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/income/abonements'] = free_abonements
    
                                                let free_items = {
                                                    items_income: 0,
                                                    items_sold: 0
                                                }
                                                updates['Fitness/'+club_name_fb[chatId]+'/analytics/current_data/income/items'] = free_items
                                                
    
                                                bot.editMessageText(`<b>Отчет готов!</b> 
Нажмите на кнопку ниже, чтобы открыть документ с отчетом. Для того, чтобы вносить изменения в этот документ, вам нужно <b>сохранить его</b>. Вы можете <b>скачать файл</b>, нажав Файл -> Скачать -> Microsoft Excel, либо <b>создать копию</b>, нажав Файл -> Создать копию`, {
                                                    parse_mode: 'HTML',
                                                    chat_id: chatId,
                                                    message_id: messages_todelete[chatId][1],
                                                    reply_markup: {
                                                        inline_keyboard: [
                                                            [{
                                                                text: '◀️ Назад',
                                                                callback_data: adminreports[1]
                                                            }],
                                                            [{
                                                                text: '🌐 Открыть отчет',
                                                                url: 'https://docs.google.com/spreadsheets/d/' + doc.spreadsheetId
                                                            }]
                                                        ]
                                                    }
                                                })
    
                                            })
                                        })    

                                    })
                                                                        // console.log(JSON.stringify(responce, null, 2)) 
                                })
    
                               /*  let copiedsheet2 = copiedoc.sheetsByIndex[1]
                                await copiedsheet2.copyToSpreadsheet(fileId).then(async function() {
                                    console.log('COPIED2')
                                    
                                })*/
                                }) 
                        })
                    })

                })
            })
        })
        
    })
}

bot.on('polling_error', console.log);

bot.on('poll_answer', poll_answer => {
    answered_feedback[poll_answer.user.id] = poll_answer.option_ids
    console.log('^^ ' + isAnswered_feedback[poll_answer.user.id])
    if (isAnswered_feedback[poll_answer.user.id] === 0){
        console.log(answered_feedback[poll_answer.user.id])
        let updates_emo = {}
        let fb_info = fb.database().ref('Fitness/' + club_name_fb[poll_answer.user.id] + '/analytics/current_data/audience/conversions/feedback/') = 
        fb_info.get().then((snapshot) => {
            
            if (answered_feedback[poll_answer.user.id][0] === 0){
                bot.sendSticker(poll_answer.user.id, sticker_goodtraining).then(() => {
                    updates_emo['Fitness/' + club_name_fb[poll_answer.user.id] + '/analytics/current_data/audience/conversions/feedback/good'] = snapshot.val().good + 1
                    bot.sendMessage(poll_answer.user.id, goodfeedback_text + 'Нажав на кнопку ниже, вы можете продлить свой абонемент 🙂', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: suggestgoodskidka_text[poll_answer.user.id][0],
                                    callback_data: suggestgoodskidka_text[poll_answer.user.id][1]
                                }],
                                [{
                                    text: continuemyabonement_text[0],
                                    callback_data: continuemyabonement_text[1]
                                }]
                            ]
                        }
                    })
                })
            }
            if (answered_feedback[poll_answer.user.id][0] === 1){
                updates_emo['Fitness/' + club_name_fb[poll_answer.user.id] + '/analytics/current_data/audience/conversions/feedback/middle'] = snapshot.val().middle + 1
                bot.sendSticker(poll_answer.user.id, sticker_badtraining).then(() => {
                    bot.sendMessage(poll_answer.user.id, normfeedback_text + 'Уверяем, что если вы приобрете наш абонемент, то мы сделаем все, чтобы Вы остались довольны на все 💯 ', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: suggestmiddleskidka_text[poll_answer.user.id][0],
                                    callback_data: suggestmiddleskidka_text[poll_answer.user.id][1]
                                }],
                                [{
                                    text: continuemyabonement_text[0],
                                    callback_data: continuemyabonement_text[1]
                                }]
                            ]
                        }
                    })
                })
            }        
            if (answered_feedback[poll_answer.user.id][0] === 2){
                bot.sendSticker(poll_answer.user.id, sticker_badtraining).then(() => {
                    updates_emo['Fitness/' + club_name_fb[poll_answer.user.id] + '/analytics/current_data/audience/conversions/feedback/bad'] = snapshot.val().bad + 1
                    programdiscount[poll_answer.user.id] = discountvalues[poll_answer.user.id][2]
                    bot.sendMessage(poll_answer.user.id, badfeedback_text + 'А что, если мы предоставим Вам <b>скидку в ' + discountvalues[poll_answer.user.id][2] + '%.</b> Дайте нам шанс доказать, что мы стоим того', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: continuemyabonement_text[0],
                                    callback_data: continuemyabonement_text[1]
                                }]
                            ]
                        }
                    })
                })
            }
            fb.database().ref().update(updates_emo)
            isAnswered_feedback[poll_answer.user.id] = 1
        })

    }
})

bot.on('pre_checkout_query', pre_checkout_query => {
    bot.answerPreCheckoutQuery( pre_checkout_query.id, true, {
        error_message: 'При оплате произошла ошибка. Попробуйте повторить действие позже'
    })

})

bot.on('location', (msg) => {

    if (userCity[msg.chat.id] !== '' && userPoint[msg.chat.id] === ''){
        
        userlocation[msg.chat.id][0] = msg.location.latitude
        userlocation[msg.chat.id][1] = msg.location.longitude
        let point1 = []
        point1[msg.chat.id] = new GeoPoint(userlocation[msg.chat.id][0], userlocation[msg.chat.id][1], false)    
        let locations_arr = []
        locations_arr[msg.chat.id] = []

        let points_data = fb.database().ref('Basement/cities/' + userCity[msg.chat.id] + '/points/')
        points_data.get().then((snapshot) => {
            let array_len = [] 
            array_len[msg.chat.id] = Object.keys(snapshot.val())
            for (let i = 0; i < array_len[msg.chat.id].length; i++){
                let info = fb.database().ref('Basement/cities/' + userCity[msg.chat.id] + '/points/' + array_len[msg.chat.id][i] + '/is_waiter')
                info.get().then((snapshot2) => {
                    if (snapshot2.val() === true){
                        let info1 = fb.database().ref('Basement/cities/' + userCity[msg.chat.id] + '/points/' + array_len[msg.chat.id][i] + '/other_info/')
                        info1.get().then((snapshot1) => {
                            let newelement = [array_len[msg.chat.id][i], snapshot1.val().adress_text, snapshot1.val().latitude, snapshot1.val().longitude]
                            locations_arr[msg.chat.id].push(newelement)
                        })
                    }

                    if (snapshot2.val() === false){
                        if (i === array_len[msg.chat.id].length){

                        }
                    }
                })
            }
        })
    }
    /* if (userCity[current_chat] === 0){
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
                                    text: youchosepoint_text,
                                    callback_data: youchosepoint_text
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
                                        text: youchosepoint_text,
                                        callback_data: youchosepoint_text
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
    } */
   // console.log('chat id: ' + msg.chat.id + /*'. Message_id: ' + msg.message + */'. Message_id2: ' + msg.message_id)
   /* for (let i = 0; i < 4; i++){
        if (msg.message_id - i > 0){
            if (i!== 0){
                bot.deleteMessage(msg.chat.id, msg.message_id - i)
            }
        }
   } */
})

bot.on('message', (msg) =>
{
    const chatId = msg.chat.id

    console.log(msg)

    current_chat = chatId

    if (userstatus[chatId] === 'unknown' || userstatus[chatId] === undefined && msg.text.includes('/start') === false){
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup'){
            bot.getChat(chatId).then(result => {
                if (result.description !== undefined && result.description !== null){
                    console.log('group: ' + result.description)
                    let del_userdata = []
                    del_userdata[msg.from.id] = result.description.split('/')
                    if (del_userdata[msg.from.id].length === 3 && del_userdata[msg.from.id][2] === (chatId).toString()){
                        club_name_fb[msg.from.id] = del_userdata[msg.from.id][0]
                        IdentifyUser(msg.from.id, false)
                    }
                }
            })
        }
        else {
            if (club_name_fb[chatId] === undefined || club_name_fb[chatId] === null){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                IdentifyUser(chatId, false)
                keyboards.GymsKeyboard(gym_keyboard[chatId], userGyms[chatId], fb, bot, chatId, mother_link, choosegym_text)
            }
        }
        console.log('dont know users status, lets check it')
    }

    if (msg.text === '🔃 На главную'){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
            if (userstatus[chatId] !== 'registered'){
                IdentifyUser(chatId, false)
            }
            
            anotherpoint_multiple[chatId] = 2
            //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
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
        if (userProgram[chatId] !== null || userProgrammesList[chatId] !== []){
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

    if (msg.text === start_training_text){
        bot.deleteMessage(chatId, msg.message_id)
        .then(()=> {
            const temp_tex = 'Подтвердите начало тренировки. Нажимая на кнопку Вы <b>подтверждаете свое присутсвие на тренировке.</b>'
            bot.sendMessage(chatId, temp_tex, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: accepttraining_text[0],
                            callback_data: accepttraining_text[1],
                        },{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ],
                }
            })
        })
    }

    if (msg.text === gotomain_text){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)], {
            reply_markup:{
                keyboard:registered_keyboard[0],
                resize_keyboard: true
            }
        })
        .then(() => {
            anotherpoint_multiple[chatId] = 2
            bot.sendMessage(chatId, hellomessage_text, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: keyboards.main_menu_keyboard
                }
            })
        })
    }

    if (msg.text === myabonement_status){

        //bot.deleteMessage(chatId, msg.message_id-1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {
            bot.sendMessage(chatId, 'Статус вашей заявки: ' + abonement_status[chatId])
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
                                                CheckUser(chatId, msg.chat.first_name, chatId, msg.message_id)
                                            })
                
                                        }
                                    }
                                }
                }
            })
        }
        
    }

    if (msg.text === location_text){
        bot.sendLocation(chatId, point_location[chatId][0], point_location[chatId][1]).then(() => {
            bot.sendMessage(chatId, '📍 Мы находимся по адресу: ' + point_adress[chatId])
        })
        
    }
    if (msg.text === phone_text){
        bot.sendContact(chatId, help_phone[chatId], club_name_fb[chatId])
    }

    if (isChangingPrefs[chatId] !== 0 && isChangingPrefs[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        if (isChangingPrefs[chatId] === 1){
            isChangingPrefs[chatId] = 0
            card_data[chatId][1] = msg.text
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/other_info/card'] = card_data[chatId][1]
            fb.database().ref().update(updates)
        }
        if (isChangingPrefs[chatId] === 2){
            isChangingPrefs[chatId] = 0
            card_data[chatId][2] = msg.text
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/other_info/fio'] = card_data[chatId][2]
            fb.database().ref().update(updates)
        }
        if (isChangingPrefs[chatId] === 3){
            isChangingPrefs[chatId] = 0
            card_data[chatId][0] = msg.text
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/other_info/kaspi_phone'] = card_data[chatId][0]
            fb.database().ref().update(updates)
        }
        bot.editMessageText('Указанные ниже данные используют Ваши клиенты при оплате абонементов и других товаров.', {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messages_todelete[chatId][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_cards[0][0] + ': ' + card_data[chatId][1],
                        callback_data: keyboard_admin_cards[0][1]
                    }],
                    [{
                        text: keyboard_admin_cards[1][0] + ': ' + card_data[chatId][2],
                        callback_data: keyboard_admin_cards[1][1]
                    },
                    {
                        text: keyboard_admin_cards[2][0] + ': ' + card_data[chatId][0],
                        callback_data: keyboard_admin_cards[2][1]
                    }]
                ]
            }
        })
    }

    if (isChangingPhone[chatId] !== 0 && isChangingPhone[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        if (isChangingPhone[chatId] === 1){
            isChangingPhone[chatId] = 0
            help_phone[chatId] = msg.text
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/other_info/contact_phone'] = help_phone[chatId][1]
            fb.database().ref().update(updates)
        }
        if (isChangingPhone[chatId] === 2){
            isChangingPhone[chatId] = 0
            support_username[chatId] = msg.text
            if (support_username[chatId].includes('@')){
                support_username[chatId] = support_username[chatId].replace('@', '')
            }
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/other_info/support_username'] = support_username[chatId]
            fb.database().ref().update(updates)
        }
        bot.editMessageText('Указанные ниже данные используют Ваши клиенты для связи с Вами', {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messages_todelete[chatId][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_phone[0][0] + ': ' + help_phone[chatId],
                        callback_data: keyboard_admin_phone[0][1]
                    }],
                    [{
                        text: keyboard_admin_phone[1][0] + ': ' + support_username[chatId],
                        callback_data: keyboard_admin_phone[1][1]
                    }]
                ]
            }
        })
    }

    if (isChangingTime[chatId] !== 0 && isChangingTime[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'У ваших пользователей могут быть ограничения по времени (напр. абонемент с 8:00-17:00). Настройте утреннее и вечернее время:'
        if (isChangingTime[chatId] === 1){
            isChangingTime[chatId] = 0
            if (msg.text.includes('-') && msg.text.includes(':')){
                morning_time[chatId] = msg.text
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/other_info/morning_time'] = msg.text
                fb.database().ref().update(updates)
            }
            else {
                fnl_txt = '<b>Вы ввели неверное значение.</b> Рекомендуем не менять эти настройки или связаться с службой поддрежки'
            }
            
        }
        if (isChangingTime[chatId] === 2){
            isChangingTime[chatId] = 0
            if (msg.text.includes('-') && msg.text.includes(':')){
                evening_time[chatId] = msg.text
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/other_info/evening_time'] = msg.text
                fb.database().ref().update(updates)
            }
            else {
                fnl_txt = '<b>Вы ввели неверное значение.</b> Рекомендуем не менять эти настройки или связаться с службой поддрежки'
            }
            
        }
        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messages_todelete[chatId][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_times[0][0] + ' ' + morning_time[chatId],
                        callback_data: keyboard_admin_times[0][1]
                    }],
                    [{
                        text: keyboard_admin_times[1][0] + ' ' + evening_time[chatId],
                        callback_data: keyboard_admin_times[1][1]
                    }]
                ]
            }
        })
    }

    if (isChangingLocation[chatId] !== 0 && isChangingLocation[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'Здесь вы можете изменить адрес вашего клуба.'
        if (isChangingLocation[chatId] === 1){
            isChangingLocation[chatId] = 0
            point_adress[chatId] = msg.text
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/other_info/adress_text'] = msg.text
            fb.database().ref().update(updates)
            
        }
        if (isChangingLocation[chatId] === 2){
            if (msg.location !== undefined){
                isChangingLocation[chatId] = 0

                point_location[chatId][0] = msg.location.latitude
                point_location[chatId][1] = msg.location.longitude

                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/other_info/latitude'] = msg.location.latitude
                updates['Fitness/' + club_name_fb[chatId] + '/other_info/longitude'] = msg.location.longitude
                fb.database().ref().update(updates)
            }
            else {
                fnl_txt = 'Вы не отправили геопозицию. Изменения не были внесены.'
            }

        }
        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messages_todelete[chatId][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_location[0][0] + point_adress[chatId],
                        callback_data: keyboard_admin_location[0][1]
                    }],
                    [{
                        text: keyboard_admin_location[1][0]  + point_location[chatId][0],
                        callback_data: keyboard_admin_location[1][1]
                    }]
                ]
            }
        })
    }

    if (isChangingCashback[chatId] !== 0 && isChangingCashback[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'Здесь вы можете настроить <b>Систему лояльности</b>. За каждую посещеную тренировку клиенты получают <b>кэшбэк</b>, который могут потратить <b>в Вашем магазине</b>. Это стимулирует продажи товаров из магазина, а также <i>мотивирует клиентов приходить на тренировки.</i>'
        if (isChangingCashback[chatId] === 1){
            isChangingCashback[chatId] = 0
            cashback[chatId] = parseInt(msg.text) 
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/loyal_system/cashback'] = cashback[chatId]
            fb.database().ref().update(updates)
        }

        if (isChangingCashback[chatId] === 2){
            isChangingCashback[chatId] = 0
            min_price[chatId] = parseInt(msg.text) 
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/loyal_system/min_price'] = min_price[chatId]
            fb.database().ref().update(updates)
        }

        if (isChangingCashback[chatId] === 3){
            isChangingCashback[chatId] = 0
            min_cashback[chatId] = parseInt(msg.text) / 100
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/loyal_system/min_cashback'] = min_cashback[chatId]
            fb.database().ref().update(updates)
        }

        if (isChangingCashback[chatId] === 4){
            isChangingCashback[chatId] = 0
            max_cashback[chatId] = parseInt(msg.text) / 100
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/loyal_system/max_cashback'] = max_cashback[chatId]
            fb.database().ref().update(updates)
        }

        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messages_todelete[chatId][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_loyal[0][0] + cashback[chatId] + ' тг.',
                        callback_data: keyboard_admin_loyal[0][1]
                    }],
                    [{
                        text: keyboard_admin_loyal[1][0] + min_price[chatId] + ' тг.',
                        callback_data: keyboard_admin_loyal[1][1]
                    }],
                    [{
                        text: keyboard_admin_loyal[3][0] + (min_cashback[chatId]*100) + '%',
                        callback_data: keyboard_admin_loyal[3][1]
                    },
                    {
                        text: keyboard_admin_loyal[4][0] + (max_cashback[chatId]*100) + '%',
                        callback_data: keyboard_admin_loyal[4][1]
                    }]
                ]
            }
        })
    }

    if (isChangingVoron[chatId] !== 0 && isChangingVoron[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        let fnl_txt = 'Здесь вы можете настроить <b>систему скидок для новых клиентов.</b> Если к Вам приходит новый клиент и покупает одну из пробных программ (на 1 день), через несколько часов после тренировки бот спросит его, все ли ему понравилось. В зависимости от ответа, <b>бот может предложить скидку на покупку полноценного абонемента</b>. Это увеличит конверсию из пробных тренировок в долгосрочные абонементы.'
        if (isChangingVoron[chatId] === 1){
            isChangingVoron[chatId] = 0
            discountvalues[chatId][0] = parseInt(msg.text) 
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/discounts/goodvalue'] = discountvalues[chatId][0]
            fb.database().ref().update(updates)
        }
        if (isChangingVoron[chatId] === 2){
            isChangingVoron[chatId] = 0
            discountvalues[chatId][1] = parseInt(msg.text) 
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/discounts/middlevalue'] = discountvalues[chatId][1]
            fb.database().ref().update(updates)
        }
        if (isChangingVoron[chatId] === 3){
            isChangingVoron[chatId] = 0
            discountvalues[chatId][2] = parseInt(msg.text) 
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/discounts/badvalue'] = discountvalues[chatId][2]
            fb.database().ref().update(updates)
        }
        if (isChangingVoron[chatId] === 4){
            isChangingVoron[chatId] = 0
            discountvalues[chatId][3] = parseInt(msg.text) 
            let updates = {}
            updates['Fitness/' + club_name_fb[chatId] + '/discounts/maxvalue'] = discountvalues[chatId][3]
            fb.database().ref().update(updates)
        }

        bot.editMessageText(fnl_txt, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messages_todelete[chatId][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_voron[0][0] + discountvalues[chatId][0] + '%',
                        callback_data: keyboard_admin_voron[0][1]
                    },
                    {
                        text: keyboard_admin_voron[1][0] + discountvalues[chatId][1] + '%',
                        callback_data: keyboard_admin_voron[1][1]
                    },
                    {
                        text: keyboard_admin_voron[3][0] + discountvalues[chatId][2] + '%',
                        callback_data: keyboard_admin_voron[3][1]
                    }],
                    [{
                        text: keyboard_admin_voron[4][0] + discountvalues[chatId][3] + ' тг.',
                        callback_data: keyboard_admin_voron[4][1]
                    }]
                ]
            }
        })
    }

    if (isMailingMessage[chatId] !== 0 && isMailingMessage[chatId] !== undefined){
        bot.deleteMessage(chatId, msg.message_id)
        //утро
        if (isMailingMessage[chatId] === 1){
            isMailingMessage[chatId] = 0
            mailing_text[chatId] = `📧 Сообщение от <b>` + club_name_fb[chatId] + `:</b>
` + msg.text
            mailing_mode[chatId] = mailing_modes[4] + 'morning'
            let info = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/time/morning/')
            info.get().then((result) => {
                if (result.exists()){
                    let num = result.val().split(',')

                    bot.editMessageText('Вы уверены, что хотите отправить это сообщение всем <b>клиентам утренних групп</b>? Это сообщение получат <b>' + num.length + ' человек </b>.', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить',
                                    callback_data: mailing_buttons[1][1]
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
                    bot.editMessageText('К сожалению в этой категории нет клиентов для рассылки. Выберите другую категорию', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: mailing_buttons[1][1]
                                }]
                            ]
                        }
                    })
                }
            })
        }
        //вечер
        if (isMailingMessage[chatId] === 2){
            isMailingMessage[chatId] = 0
            mailing_text[chatId] = `📧 Сообщение от <b>` + club_name_fb[chatId] + `:</b>
` + msg.text
            mailing_mode[chatId] = mailing_modes[4] + 'evening'
            let info = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/time/evening/')
            info.get().then((result) => {
                if (result.exists()){
                    let num = result.val().split(',')

                    bot.editMessageText('Вы уверены, что хотите отправить это сообщение всем <b>клиентам вечерних групп</b>? Это сообщение получат <b>' + num.length + ' человек </b>.', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить',
                                    callback_data: mailing_buttons[1][1]
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
                    bot.editMessageText('К сожалению в этой категории нет клиентов для рассылки. Выберите другую категорию', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: mailing_buttons[1][1]
                                }]
                            ]
                        }
                    })
                }
                
            })
        }
        //всем
        if (isMailingMessage[chatId] === 3){
            isMailingMessage[chatId] = 0
            mailing_text[chatId] =`📧 Сообщение от <b>` + club_name_fb[chatId] + `:</b>
` + msg.text
            mailing_mode[chatId] = mailing_modes[0]
            let info = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/all/')
            info.get().then((result) => {
                if (result.exists()){
                    let num = result.val().split(',')

                    bot.editMessageText('Вы уверены, что хотите отправить это сообщение всем <b>клиентам</b>? Это сообщение получат <b>' + num.length + ' человек </b>.', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить',
                                    callback_data: mailing_time[2][1]
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
                    bot.editMessageText('К сожалению в этой категории нет клиентов для рассылки. Выберите другую категорию', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: mailing_time[2][1]
                                }]
                            ]
                        }
                    })
                }
                
            })
        }
        //по периодам
        if (isMailingMessage[chatId] === 4){
            isMailingMessage[chatId] = 0
            mailing_text[chatId] = `📧 Сообщение от <b>` + club_name_fb[chatId] + `:</b>
` + msg.text
            let info = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/period/' + mailing_mode[chatId])
            info.get().then((result) => {
                if (result.exists()){
                    let num = result.val().split(',')
                    mailing_mode[chatId] = 'period' + mailing_mode[chatId]
                    bot.editMessageText('Вы уверены, что хотите отправить это сообщение всем <b>клиентам</b>? Это сообщение получат <b>' + num.length + ' человек </b>.', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить',
                                    callback_data: mailing_buttons[2][1]
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
                    bot.editMessageText('К сожалению в этой категории нет клиентов для рассылки. Выберите другую категорию', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: mailing_buttons[2][1]
                                }]
                            ]
                        }
                    })
                }
                
            })
        }
        //по программе
        if (isMailingMessage[chatId] === 5){
            isMailingMessage[chatId] = 0
            mailing_text[chatId] = `📧 Сообщение от <b>` + club_name_fb[chatId] + `:</b>
` + msg.text
            let inf = mailing_mode[chatId].split('_')
            let category = inf[1]
            let program = inf[2]
            let info = fb.database().ref('Fitness/' + club_name_fb[chatId] + '/mailing/categories/' + category + '/' + program + '/value')
            info.get().then((result) => {
                console.log(result.val())
                if (result.exists()){
                    let num = result.val().split(',')
                    bot.editMessageText('Вы уверены, что хотите отправить это сообщение всем <b>клиентам данной категории</b>? Это сообщение получат <b>' + num.length + ' человек </b>.', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить',
                                    callback_data: mailing_time[2][1]
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
                    bot.editMessageText('К сожалению в этой категории нет клиентов для рассылки. Выберите другую категорию', {
                        parse_mode: 'HTML',
                        chat_id: chatId,
                        message_id: messages_todelete[chatId][1],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: mailing_time[2][1]
                                }]
                            ]
                        }
                    })
                }
                
            })
        }
    }

    if (isMakingChanges[chatId] !== 0  && userstatus[chatId] !== undefined){
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
            updates['Basement/clients/' + msg.chatId + '/email'] = user_email[chatId]
            updates['Basement/clients/' + msg.chatId + '/coins'] = user_coins[chatId]
            fb.database().ref().update(updates).then(() => {
                //тут отправить в главное меню
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        console.log(err)
                    })
                }
                bot.sendMessage(chatId, 'Ура! Email подтвержден. Вам было зачислено ' + (added_coins[chatId] * percent_foremail) + ' тенге. Ваш баланс: ' + user_coins[chatId] + ' тенге').then(() => {
                    IdentifyUser(chatId, false)
                    anotherpoint_multiple[chatId] = 2
                    keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
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
                updates['Basement/clients/' + chatId + '/coins'] = user_coins[chatId]
                fb.database().ref().update(updates).then(() => {
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                            console.log(err)
                        })
                    }
                    bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                        IdentifyUser(chatId)
                        anotherpoint_multiple[chatId] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
                    })

                    let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
├ Оценка клиента: ` + feedback_options[answered_feedback[chatId]] + `
└ Сообщение: ` + msg.text
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: operators_chat[chatId],
                        message_id: snapshot.val().message_id
                    })
                }).catch(error => {
                    console.log(error)
                })
            }) 
        }

        if (/* user_adress[chatId] !== '' &&  */user_phone[chatId] !== '' && user_name[chatId] !== '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5){
            //order_status = order_statuses_text[0]
            console.log('LOL ' + msg.message_id + ', ' + (msg.message_id - 1))
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                console.log('LOL2 ' + msg.message_id + ', ' + (msg.message_id - 1))
            })

            bot.editMessageText(almostthere2_text, {
                chat_id: chatId,
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: backtoprogramme_text[0],
                            callback_data: backtoprogramme_text[1]
                        }],
                        [{
                            text: 'Имя: ' + user_name[chatId],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chatId],
                            callback_data: changephone_text
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
            .then(res => {
                messages_todelete[chatId][2] = res.message_id
            })
            
        }
        if (user_phone[chatId] === '' || user_name[chatId] === '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5)
        {
            console.log('LOL3 ' + msg.message_id + ', ' + (msg.message_id - 1) + ', save_msgid: ' + add_info_msg[chatId])
            bot.deleteMessage(chatId, msg.message_id)
            
            bot.editMessageText(almostthere_text, {
                chat_id: chatId,
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: backtoprogramme_text[0],
                            callback_data: backtoprogramme_text[1]
                        }],
                        [{
                            text: 'Имя: ' + user_name[chatId],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chatId],
                            callback_data: changephone_text
                        }]
                    ]
                }
            }
            ).catch(err => {
                console.log(err)
            })
            .then(res => {
                messages_todelete[chatId][2] = res.message_id
            })
            
            
        }
    }

    if (isMakingChanges_2[chatId] !== 0 && userstatus[chatId] !== undefined){
        if (isMakingChanges_2[chatId] === 1){
            isMakingChanges_2[chatId] = 0
            bot.deleteMessage(chatId, msg.message_id)
            if ((msg.text).includes('.') || (msg.text).includes('@') || (msg.text).includes(',')){
                bot.editMessageText('Извини, но как нам узнать тебя, если ты не вводишь свои реальные ФИО? Так не пойдет 😒', {
                    parse_mode: 'HTML',
                    chat_id: chatId,
                    message_id: messages_todelete[chatId][4],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backadduserdata_text[0],
                                callback_data: backadduserdata_text[1]
                            }],
                            [{
                                text: 'ФИО: ' + user_name[chatId],
                                callback_data: adduserinfo_text[0]
                            },
                            {
                                text: 'Телефон: ' + user_phone[chatId],
                                callback_data: adduserinfo_text[1]
                            }],
                            [{
                                text: 'Email: ' + user_email[chatId],
                                callback_data: adduserinfo_text[2]
                            }]
                        ]
                    }
                })
            }
            else {
                user_name[chatId] = msg.text
    
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/clients/' + chatId + '/name'] = user_name[chatId] 
                updates['Motherbase/clients/' + chatId + '/name'] = user_name[chatId] 
                fb.database().ref().update(updates)
                
                bot.editMessageText(messages_texts[chatId][3], {
                    parse_mode: 'HTML',
                    chat_id: chatId,
                    message_id: messages_todelete[chatId][4],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backadduserdata_text[0],
                                callback_data: backadduserdata_text[1]
                            }],
                            [{
                                text: 'ФИО: ' + user_name[chatId],
                                callback_data: adduserinfo_text[0]
                            },
                            {
                                text: 'Телефон: ' + user_phone[chatId],
                                callback_data: adduserinfo_text[1]
                            }],
                            [{
                                text: 'Email: ' + user_email[chatId],
                                callback_data: adduserinfo_text[2]
                            }]
                        ]
                    }
                })
            }
            
        }
        if (isMakingChanges_2[chatId] === 2){
            console.log('making changes 1')
            bot.deleteMessage(chatId, msg.message_id)
            if (msg.contact !== undefined){
                console.log('making changes 2')
                isMakingChanges_2[chatId] = 0
                if (user_phone[chatId] === undefined || user_phone[chatId] === 'unknown' || user_phone[chatId] === ''){
                    guserdata[chatId] = []
                    console.log('making changes 3')
                    let sh_info = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/clients/' + chatId);
                    sh_info.get().then(async function(snap) {
                        console.log('making changes 4')
                        guserdata[chatId][0] = snap.val().userrow
                        guserdata[chatId][1] = (msg.contact.phone_number).toString()
                        GoogleChangePhone(chatId, guserdata[chatId])
                    })
                    
                }
                user_phone[chatId] = msg.contact.phone_number
    
                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/clients/' + chatId + '/phone'] = user_phone[chatId] 
                updates['Motherbase/clients/' + chatId + '/phone'] = user_phone[chatId] 
                fb.database().ref().update(updates)
                bot.deleteMessage(chatId, messages_todelete[chatId][4])
                .then(() => {
                    bot.sendMessage(chatId, messages_texts[chatId][3], {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backadduserdata_text[0],
                                    callback_data: backadduserdata_text[1]
                                }],
                                [{
                                    text: 'ФИО: ' + user_name[chatId],
                                    callback_data: adduserinfo_text[0]
                                },
                                {
                                    text: 'Телефон: ' + user_phone[chatId],
                                    callback_data: adduserinfo_text[1]
                                }],
                                [{
                                    text: 'Email: ' + user_email[chatId],
                                    callback_data: adduserinfo_text[2]
                                }]
                            ]
                        }
                    })
                    .then(res => {
                        messages_todelete[chatId][4] = res.message_id
                    })
                    
                })
                
            }
            
        }

        if (isMakingChanges_2[chatId] === 3){
            isMakingChanges_2[chatId] = 0
            bot.deleteMessage(chatId, msg.message_id)
            if ((msg.text).includes('@') === false){
                bot.editMessageText('Извини, но как нам узнать тебя, если ты не вводишь свои реальные данные? Так не пойдет 😒', {
                    parse_mode: 'HTML',
                    chat_id: chatId,
                    message_id: messages_todelete[chatId][4],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backadduserdata_text[0],
                                callback_data: backadduserdata_text[1]
                            }],
                            [{
                                text: 'ФИО: ' + user_name[chatId],
                                callback_data: adduserinfo_text[0]
                            },
                            {
                                text: 'Телефон: ' + user_phone[chatId],
                                callback_data: adduserinfo_text[1]
                            }],
                            [{
                                text: 'Email: ' + user_email[chatId],
                                callback_data: adduserinfo_text[2]
                            }]
                        ]
                    }
                })
            }   
            else {
                user_email[chatId] = msg.text

                let updates = {}
                updates['Fitness/' + club_name_fb[chatId] + '/clients/' + chatId + '/email'] = user_email[chatId] 
                updates['Motherbase/clients/' + chatId + '/email'] = user_email[chatId] 
                fb.database().ref().update(updates)
                bot.editMessageText(messages_texts[chatId][3], {
                    parse_mode: 'HTML',
                    chat_id: chatId,
                    message_id: messages_todelete[chatId][4],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backadduserdata_text[0],
                                callback_data: backadduserdata_text[1]
                            }],
                            [{
                                text: 'ФИО: ' + user_name[chatId],
                                callback_data: adduserinfo_text[0]
                            },
                            {
                                text: 'Телефон: ' + user_phone[chatId],
                                callback_data: adduserinfo_text[1]
                            }],
                            [{
                                text: 'Email: ' + user_email[chatId],
                                callback_data: adduserinfo_text[2]
                            }]
                        ]
                    }
                })
            } 
            
        }
    }

    if (msg.text === backtoadduserinfo_text[0]){
        isMakingChanges_2[chatId] = 0
        bot.deleteMessage(chatId, messages_todelete[chatId][4])
        bot.sendMessage(chatId, messages_texts[chatId][3], {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backadduserdata_text[0],
                        callback_data: backadduserdata_text[1]
                    }],
                    [{
                        text: 'ФИО: ' + user_name[chatId],
                        callback_data: adduserinfo_text[0]
                    },
                    {
                        text: 'Телефон: ' + user_phone[chatId],
                        callback_data: adduserinfo_text[1]
                    }],
                    [{
                        text: 'Email: ' + user_email[chatId],
                        callback_data: adduserinfo_text[2]
                    }]
                ]
            }
        })
        .then(res => {
            messages_todelete[chatId][4] = res.message_id
        })
    }

    if (msg.text === order_status_button){
        bot.deleteMessage(msg.chatId, msg.message_id).then(() => {
            console.log('Order name: "' + order_name[chatId] + '"')
            let userdata = fb.database().ref(order_name[chatId])
            userdata.get().then((result) => {
                abonement_status[chatId] = result.val().order_status
                console.log('order_status: ' + result.val().order_status)
                console.log('order link: Basement/bills/' + order_name[chatId])
                bot.sendMessage(msg.chatId, 'Статус вашего заказа: ' + abonement_status[chatId])
            }) 
        })
    }

    if (msg.text === 'erheoirhjeoihri'){
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
                updates['Basement/clients/' + msg.chatId + '/coins'] = user_coins[chatId]
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
        updates['Basement/clients/' + msg.chatId + '/coins'] = user_coins[chatId]
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chatId, didntaddemail_text).then(() => {
                IdentifyUser(chatId)
                anotherpoint_multiple[chatId] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
            })
        })

    }

})

bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message
    current_chat = chat.id

    console.log(query.data)
    console.log(query)
    console.log(userstatus[query.from.id] + ', ' + isAdmin[query.from.id])
    if (userstatus[query.from.id] === 'unknown' || userstatus[query.from.id] === undefined /* && isAdmin[query.from.id] === false */){
        if (chat.type === 'group' || chat.type === 'supergroup'){
            bot.getChat(chat.id).then(result => {
                if (result.description !== undefined && result.description !== null){
                    console.log('group: ' + result.description)
                    let del_userdata = []
                    del_userdata[chat.id] = result.description.split('/')
                    if (del_userdata[chat.id].length === 3 && del_userdata[chat.id][2] === (chat.id).toString()){
                        club_name_fb[query.from.id] = del_userdata[chat.id][0]
                        IdentifyUser(query.from.id, false)
                    }
                }
            })
        }
        else {
            for (let i = 0; i < userGyms[chat.id].length; i++){
                if (query.data === userGyms[chat.id][i]){
                    //userstatus[chat.id] = 'unknown'
                    club_name_fb[chat.id] = userGyms[chat.id][i]
                    console.log('@#$@%')
                    
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chat.id, message_id - i).catch(err => {
                            //console.log(err)
                        })
                    }
                    bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                    .then(() => {
                        anotherpoint_multiple[chat.id] = 2
                        bot.sendMessage(chat.id, hellomessage_text, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: keyboards.main_menu_keyboard
                            }
                        })
                        .then(() => {
                            IdentifyUser(chat.id, false)
                        })
                    })
                    
                }

                else {
                    if (club_name_fb[chat.id] === undefined || club_name_fb[chat.id] === null){
                        for (let i=0; i<100; i++){
                            bot.deleteMessage(chat.id, message_id - i + 1).catch(err => {
                                //console.log(err)
                            })
                        }
                        IdentifyUser(chat.id, false)
                        keyboards.GymsKeyboard(gym_keyboard[chat.id], userGyms[chat.id], fb, bot, chat.id, mother_link, choosegym_text)
                    }
                }
            }

            /* if (club_name_fb[chat.id] === undefined || club_name_fb[chat.id] === null){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i + 1).catch(err => {
                        //console.log(err)
                    })
                }
                IdentifyUser(chat.id, false)
                keyboards.GymsKeyboard(gym_keyboard[chat.id], userGyms[chat.id], fb, bot, chat.id, mother_link, choosegym_text)
            } */
        }
        console.log('dont know users status, lets check it')
        
    }

    if (chat.type === 'private'  /* && chat.id !== admin_id[chat.id] */){ 
    
        if (query.data === keyboards.main_menu_buttons[1][1]){
            //bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            bot.editMessageText(text, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log('here: ' + err)})
            keyboards.ProgramCategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, backtomain_text, choosecategory_text, club_name_fb[chat.id])
        }

        if (query.data === continuemyabonement_text[1]){
            
            let stringyy = programme_pas[chat.id]
            console.log(programme_pas[chat.id])
            stringyy = stringyy.split('/')

            userCategory[chat.id] = stringyy[4]
            userProgram[chat.id] = stringyy[6]

            console.log('cl ' + stringyy + ', cat: ' + userCategory[chat.id] + ', prog: ' + userProgram[chat.id])

            let program_photo_link = []
            program_photo_link[chat.id] = ''
            let program_description = []
            program_description[chat.id] = ''
            let program_peopleamount = []
            program_peopleamount[chat.id] = ''
            let program_trener_link = []
            program_trener_link[chat.id] = ''
            let program_trener_name = []
            program_trener_name[chat.id] = ''
            let program_name = []
            program_name[chat.id] = ''

/*             if (stringyy[8] === 'onetime'){
                //одноразовая тренировка
            }

            else {

            } */
            
            bot.deleteMessage(chat.id, message_id).then(() => {
                let prg_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/')
                prg_info.get().then((snapshot) =>
                {
                    program_photo_link[chat.id] = snapshot.val().photo_link

                    program_description[chat.id] = snapshot.val().description
                    program_name[chat.id] = snapshot.val().name
                    program_trener_link[chat.id] = snapshot.val().trener_link
                    program_trener_name[chat.id] = snapshot.val().trener_name

                    program_peopleamount[chat.id] = snapshot.val().people_in_group

                    let pamount_values = []
                    pamount_values[chat.id] = []

                    if (program_peopleamount[chat.id] !== 'unlimited') {
                        pamount_values[chat.id] = program_peopleamount[chat.id].split('/')
                        pamount_values[chat.id][0] = parseInt(pamount_values[chat.id][0])
                        pamount_values[chat.id][1] = parseInt(pamount_values[chat.id][1])
                    }

                    let types_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/types/')
                    types_info.get().then((snapshot) => {
                        let types_amount = []
                        types_amount[chat.id] = Object.keys(snapshot.val())
                        types_keyboard[chat.id] = [[],[], []]
                        types_keyboard[chat.id][0][0] = 
                        {
                            text: anotherprogram_text,
                            callback_data: anotherprogram_text
                        }
                        console.log(Object.keys(snapshot.val()))
                        for (let i = 0; i < types_amount[chat.id].length; i++){
                            let info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/types/' + types_amount[chat.id][i])
                            info.get().then((result) => {
                                temp_program_types[chat.id][i] = [result.val().period, result.val().price, result.val().time, result.val().type_name, result.val().visits, result.val().is_freeze, program_name[chat.id]] 
                                console.log(temp_program_types[chat.id][i])
                                if (pamount_values[chat.id][0] < pamount_values[chat.id][1] || program_peopleamount[chat.id] === 'unlimited') {
                                    types_keyboard[chat.id][1][i] = 
                                    {
                                        text: result.val().type_name,
                                        callback_data: choosetype_callback + result.val().type_name
                                    }
                                }
                                

                                if (i === types_amount[chat.id].length - 1){
                                    temp_progtypes_text[chat.id] = `<b>` + program_name[chat.id] + `</b>
` + program_description[chat.id]
                                    if (program_trener_link[chat.id] !== 'unknown' && program_trener_name[chat.id] !== 'unknown') {
                                        temp_progtypes_text[chat.id] += `
                                            
<b>Тренер: </b><a href="`+ program_trener_link[chat.id] +`">`+ program_trener_name[chat.id] + `</a>` 
                                    }
                                    if (program_trener_link[chat.id] === 'unknown' && program_trener_name[chat.id] !== 'unknown') {
                                        temp_progtypes_text[chat.id] += `
                                            
<b>Тренер: </b>`+ program_trener_name[chat.id] 
                                    }

                                    if (program_peopleamount[chat.id] !== 'unlimited'){
                                        temp_progtypes_text[chat.id] += `
                                    
<b>Записались:</b> ` + program_peopleamount[chat.id]
                                    }

                                    

                                    if (pamount_values[chat.id][0] < pamount_values[chat.id][1] ||  program_peopleamount[chat.id] === 'unlimited') {
                                        temp_progtypes_text[chat.id] += `
                                    
Выберите подходящий тип программы: `
                                    }

                                    if (pamount_values[chat.id][0] >= pamount_values[chat.id][1]) {
                                        favourite_program[chat.id] = myprogram_type[chat.id][6]
                                        /* if (waitlist[chat.id] === ''){
                                            waitlist[chat.id] = myprogram_type[chat.id][6]
                                            let wait_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/mailing/waitlist/programmes/' + myprogram_type[chat.id][6])
                                            wait_data.get().then((result) => {
                                                let local_waitlist = result.val()
                                                let lists_array = local_waitlist.split(',')
                                                for(let i = 0; i<lists_array; i++){
                                                    if (lists_array[i] === chat.id){
                                                        break
                                                    }
                                                    if (i === lists_array - 1 && lists_array[i] !== chat.id){
                                                        if (local_waitlist = '0'){
                                                            local_waitlist = (chat.id).toString()
                                                        }
                                                        if (local_waitlist !== '0'){
                                                            local_waitlist += ',' + chat.id
                                                        }
    
                                                        let updates = {}
                                                        updates['Fitness/'+club_name_fb[chat.id]+'/mailing/waitlist/programmes/' + myprogram_type[chat.id][6]] = local_waitlist
                                                        fb.database().ref().update(updates)
                                                    }
                                                }
                                            })
                                        } */
                                        
                                        temp_progtypes_text[chat.id] += `
                                    
<i>К сожалению, все места заняты</i> `
                                        types_keyboard[chat.id][1][0] = 
                                        {
                                            text: 'Оставить заявку',
                                            url: 'https://t.me/' + support_username[chat.id]
                                        }
                                    }
                                    
                                    if (program_photo_link[chat.id] !== 'unknown'){
                                        bot.sendPhoto(chat.id, program_photo_link[chat.id], {
                                            parse_mode: 'HTML',
                                            caption: temp_progtypes_text[chat.id],
                                            reply_markup:{
                                                inline_keyboard:types_keyboard[chat.id]
                                            }
                                        })
                                        .then(res => {
                                            messages_todelete[chat.id][0] = res.message_id
                                            messages_texts[chat.id][0] = res.caption
                                        })
                                        .catch(err => {console.log(err)})
                                    }

                                    if (program_photo_link[chat.id] === 'unknown'){
                                        bot.sendMessage(chat.id, temp_progtypes_text[chat.id], {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:types_keyboard[chat.id]
                                            }
                                        })
                                        .then(res => {
                                            messages_todelete[chat.id][0] = res.message_id
                                            messages_texts[chat.id][0] = res.caption
                                        })
                                        .catch(err => {console.log(err)})
                                    }
                                    
                                }
                            })
                        }
                    })

                }).catch((err) => {console.log(err)})
            })
        }

        if (query.data === refuseskidka_text[1]){
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
            .then(() => {
                anotherpoint_multiple[chat.id] = 2
                bot.sendMessage(chat.id, hellomessage_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.main_menu_keyboard
                    }
                })
                .then(() => {
                    IdentifyUser(chat.id, true)
                })
            })
        }
        if (suggestgoodskidka_text[chat.id] !== undefined && suggestbadskidka_text[chat.id] !== undefined){
            if (query.data === suggestgoodskidka_text[chat.id][1]){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chat.id] = 2
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                })
                deelay[chat.id](1800000).then(() => {
                    programdiscount[chat.id] = discountvalues[chat.id][0]
                    bot.sendMessage(chat.id, suggestgoodskidka_text[chat.id][2], {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: refuseskidka_text[0],
                                    callback_data: refuseskidka_text[1]
                                }],
                                [{
                                    text: continuemyabonement_text[0],
                                    callback_data: continuemyabonement_text[1]
                                }]
                            ]
                        }
                    })
                    
                })
            }
            if (query.data === suggestmiddleskidka_text[chat.id][1]){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chat.id] = 2
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                })
                deelay[chat.id](2*3600000).then(() => {
                    programdiscount[chat.id] = discountvalues[chat.id][1]
                    bot.sendMessage(chat.id, suggestmiddleskidka_text[chat.id][2], {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: refuseskidka_text[0],
                                    callback_data: refuseskidka_text[1]
                                }],
                                [{
                                    text: continuemyabonement_text[0],
                                    callback_data: continuemyabonement_text[1]
                                }]
                            ]
                        }
                    })
                    
                })
            }
        }

        if (query.data === keyboards.main_menu_buttons[2][1]){
            bot.editMessageText(text, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log('here: ' + err)})
            keyboards.TrenersKeyboard(trener_keyboard[chat.id], userTreners[chat.id], fb, bot, chat.id, backtomain_text, choosetrener_text, club_name_fb[chat.id])
        }
    
        if (query.data === query_deletethismessage){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
            .then(() => {
                anotherpoint_multiple[chat.id] = 2
                bot.sendMessage(chat.id, hellomessage_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.main_menu_keyboard
                    }
                })
            })
        }

        if (query.data === igotmyitem_text[1]){
            if (skidka[chat.id] !== 0) {
                let updates = {}
                updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+chat.id + '/coins'] = user_coins[chat.id] - skidka[chat.id]
                fb.database().ref().update(updates)
            }
            if (userstatus[chat.id] === 'registered'){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chat.id] = 2
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                })
            }
        }

        if (query.data === unfreezeabonement1_text[1]){
            bot.editMessageText(messages_texts[chat.id][2], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id
            })
            .then(() => {
                let frz_text = `Вы уверены, что хотите разморозить свой абонемент? Мы посчитаем, сколько дней вы пропустили и продлим действие вашего абонемента`
                bot.sendMessage(chat.id, frz_text, {
                    parse_mode: 'HTML',
                    reply_markup:{
                        inline_keyboard: [
                            [{
                                text: unfreezeabonement2_text[0],
                                callback_data: unfreezeabonement2_text[1]
                            }],
                            [{
                                text: backtomain_text,
                                callback_data: backtomain_text
                            }]
                        ]
                    }
                })
            })
        }

        if (query.data === unfreezeabonement2_text[1]){
            bot.deleteMessage(chat.id, message_id)
            .then(() => {
                let ppl_ingroup = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id);
                ppl_ingroup.get().then((snapshot) => {
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
                    let time_freeze = new Date(snapshot.val().abonement.freeze_start)

                    let finaltime = time_now.getTime() - time_freeze.getTime()
                    finaltime = finaltime / (1000 * 3600 * 24)
                    finaltime =  Math.round(finaltime)
                    console.log('4236!!! ' + finaltime)
                    let updates = {}
                    let visible_date_accept

                    guserdata[chat.id] = []
                    let frz_text
                    if (finaltime === 0){
                        frz_text = 'После активации заморозки должен пройти минимум 1 день. Вы сможете снять заморозку завтра 🙂'
                    
                        bot.sendMessage(chat.id, frz_text, {
                            parse_mode: 'HTML',
                            reply_markup:{
                                inline_keyboard: [
                                    [{
                                        text: backtomain_text,
                                        callback_data: backtomain_text
                                    }]
                                ]
                            }
                        })
                    
                    }

                    if (finaltime > 0){
                        if (finaltime < snapshot.val().abonement.freeze_amount){
                            let newend_date = new Date(snapshot.val().abonement.end_date)
                            newend_date.setDate(newend_date.getDate() + finaltime)
                            guserdata[chat.id][3] = snapshot.val().abonement.freeze_amount - finaltime
                            updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/freeze_amount'] = snapshot.val().abonement.freeze_amount - finaltime
                            updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/end_date'] = newend_date.getTime()
                            updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/freeze_start'] = '0'
                            let Astana_date_accept = new Date(newend_date.getTime())  
                            let minutes2 = Astana_date_accept.getMinutes()
                            if (minutes2 < 10) minutes2 = '0' + minutes2
                            let hours2 = Astana_date_accept.getHours()
                            if (hours2 < 10) hours2 = '0' + hours2
                            visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()    
                            frz_text = `Ваш абонемент теперь снова активен 🧊`
                        }
    
                        if (finaltime >= snapshot.val().abonement.freeze_amount){
                            let newend_date = new Date(snapshot.val().abonement.end_date)
                            newend_date.setDate(newend_date.getDate() + snapshot.val().abonement.freeze_amount)
                            updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/freeze_amount'] = 0
                            updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/end_date'] = newend_date.getTime()
                            updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/freeze_start'] = '0'
                            let Astana_date_accept = new Date(newend_date.getTime())  
                            let minutes2 = Astana_date_accept.getMinutes()
                            if (minutes2 < 10) minutes2 = '0' + minutes2
                            let hours2 = Astana_date_accept.getHours()
                            if (hours2 < 10) hours2 = '0' + hours2
                            visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()
                            guserdata[chat.id][3] = 0
                        }
                        
                        updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/abonement_status'] = abonement_statuses_text[2]
    
                        
                        fb.database().ref().update(updates)
                        guserdata[chat.id][0] = snapshot.val().userrow +1
                        guserdata[chat.id][1] = abonement_statuses_text[2]
                        guserdata[chat.id][2] = 'Нет'
                        guserdata[chat.id][4] = visible_date_accept
    
                        GoogleUnFreezeUser(chat.id, guserdata[chat.id])
                        frz_text = `Ваш абонемент теперь снова активен 🧊`
    
                        bot.sendMessage(chat.id, frz_text, {
                            parse_mode: 'HTML',
                            reply_markup:{
                                inline_keyboard: [
                                    [{
                                        text: backtomain_text,
                                        callback_data: backtomain_text
                                    }]
                                ]
                            }
                        })

                        let anal = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/analytics/current_data/audience/stats/')
                        anal.get().then((an) =>{
                            let mini_update = {}
                            mini_update['Fitness/' + club_name_fb[chat.id] + '/analytics/current_data/audience/stats/freeze'] = (an.val().freeze - 1)
                            mini_update['Fitness/' + club_name_fb[chat.id] + '/analytics/current_data/audience/stats/active'] = (an.val().active + 1)
                            fb.database().ref().update(mini_update)
                        })
                    }

                    
                })

                
                
            })
        }

        if (query.data === freezeabonement1_text[1]){
            bot.editMessageText(messages_texts[chat.id][2], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id
            })
            .then(() => {
                let frz_text = `Вы можете заморозить свой абонемент на любой срок до <b>` + user_freezeamount[chat.id] + ` дней. </b> Чтобы разморозить абонемент, зайдите в <b>` + keyboards.main_menu_buttons[0][0] + `</b> и нажмите <b>` + unfreezeabonement1_text[0] + `</b>, либо просто начните тренировку. `
                bot.sendMessage(chat.id, frz_text, {
                    parse_mode: 'HTML',
                    reply_markup:{
                        inline_keyboard: [
                            [{
                                text: freezeabonement2_text[0],
                                callback_data: freezeabonement2_text[1]
                            }],
                            [{
                                text: backtomain_text,
                                callback_data: backtomain_text
                            }]
                        ]
                    }
                })
            })
            .catch(err => {console.log('h: ' + err)})
        }

        if (query.data === freezeabonement2_text[1]){
            bot.deleteMessage(chat.id, message_id)
            .then(() => {
                let ppl_ingroup = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id);
                ppl_ingroup.get().then((snapshot) => {
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let time_now = new Date(utcTime + (3600000 * timeOfffset))

                    let updates = {}
                    updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/abonement_status'] = abonement_statuses_text[1]
                    updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+ chat.id + '/abonement/freeze_start'] = time_now.getTime()

                    let Astana_date_accept = new Date(time_now.getTime())  
                    let minutes2 = Astana_date_accept.getMinutes()
                    if (minutes2 < 10) minutes2 = '0' + minutes2
                    let hours2 = Astana_date_accept.getHours()
                    if (hours2 < 10) hours2 = '0' + hours2
                    let visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()

                    guserdata[chat.id] = []
                    guserdata[chat.id][0] = snapshot.val().userrow +1
                    guserdata[chat.id][1] = abonement_statuses_text[1]
                    guserdata[chat.id][2] = visible_date_accept

                    GoogleFreezeUser(chat.id, guserdata[chat.id])

                    fb.database().ref().update(updates)

                    let anal = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/analytics/current_data/audience/stats/')
                    anal.get().then((an) =>{
                        let mini_update = {}
                        mini_update['Fitness/' +  club_name_fb[chat.id] + '/analytics/current_data/audience/stats/freeze'] = (an.val().freeze + 1)
                        mini_update['Fitness/' +  club_name_fb[chat.id] + '/analytics/current_data/audience/stats/active'] = (an.val().active - 1)
                        fb.database().ref().update(mini_update)
                    })

                })

                let frz_text = `Ваш абонемент был заморожен`
                bot.sendMessage(chat.id, frz_text, {
                    parse_mode: 'HTML',
                    reply_markup:{
                        inline_keyboard: [
                            [{
                                text: backtomain_text,
                                callback_data: backtomain_text
                            }]
                        ]
                    }
                })
            })
        }

        if (query.data === keyboards.main_menu_buttons[0][1]){
            if (userstatus[chat.id] !== 'registered'){
                bot.editMessageText(text, {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_id
                }).then(() => {
                    bot.sendMessage(chat.id, 'У вас еще нет абонемента. Самое время его выбрать!', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: backtomain_text,
                                    callback_data: backtomain_text
                                }],
                                [{
                                    text: keyboards.main_menu_buttons[1][0],
                                    callback_data: keyboards.main_menu_buttons[1][1]
                                }]
                            ]
                        }
                    })
                })
            }
            if (userstatus[chat.id] === 'registered'){
                
                bot.editMessageText(text, {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_id
                }).then(() => {
                    let abonem_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id)
                    abonem_data.get().then((result) => {
                        let date = new Date()
                        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                        let timeOfffset = 6 //Astana GMT +6
                        let time_now = new Date(utcTime + (3600000 * timeOfffset))
                        let Astana_date_end = new Date(result.val().abonement.end_date)  
                        let time_freeze = new Date(result.val().abonement.freeze_start)
                        
                        let minutes = Astana_date_end.getMinutes()
                        if (minutes < 10) minutes = '0' + minutes
                        let hours = Astana_date_end.getHours()
                        if (hours < 10) hours = '0' + hours
                        let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_end) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date_end.getDate() + '.' + (Astana_date_end.getMonth() + 1) + '.' + Astana_date_end.getFullYear()        

                        let finaltime = time_now.getTime() - time_freeze.getTime()
                        finaltime = finaltime / (1000 * 3600 * 24)
                        finaltime =  Math.round(finaltime)

                        if (time_now > Astana_date_end && result.val().abonement.abonement_status === abonement_statuses_text[2] ) {
                            StartTraining(chat.id, message_id)
                        }

                        let kb = []

                        let temp_mes = `<b>Ваш абонемент: </b>` + result.val().abonement.abonement_status + `

<b>Название программы:</b> ` + result.val().abonement.name + `
<b>Продолжительность: </b>` + result.val().abonement.period + ` мес.
<b>Стоимость: </b>` + result.val().abonement.price + ` тенге `

    temp_mes += `

📅 Абонемент годен до: ` + visible_date_end

if (time_now.getFullYear() === Astana_date_end.getFullYear() && time_now.getMonth() === Astana_date_end.getMonth() && time_now.getDate() <= Astana_date_end.getDate()){
    if ((Astana_date_end.getDate() - time_now.getDate()) <= 3){
        temp_mes +=  ` (❗️ Осталось ` + (Astana_date_end.getDate() - time_now.getDate()) + ` дн.)`
    }
}

kb.push([{
    text: continuemyabonement_text[0],
    callback_data: continuemyabonement_text[1]
},
{
    text: 'Сменить программу 🏋️‍♂️',
    callback_data: keyboards.main_menu_buttons[1][1]
}])

    if (result.val().abonement.visits !== 'unlimited'){
        temp_mes += `
👣 Посещений осталось: ` + result.val().abonement.visits
        if (result.val().abonement.visits <= 3){
            temp_mes += ` (❗️)`
        }
    }
    if (result.val().abonement.time !== 'unlimited'){
        if (result.val().abonement.time === 'evening'){
            temp_mes += `
🕔 Время: с ` + evening_time[chat.id][0][0] + ':' + evening_time[chat.id][0][1] + ' до ' +  evening_time[chat.id][1][0] + ':' + evening_time[chat.id][1][1]
        }
        if (result.val().abonement.time === 'morning'){
            temp_mes += `
🕔 Время: с ` + morning_time[chat.id][0][0] + ':' + morning_time[chat.id][0][1] + ' до ' +  morning_time[chat.id][1][0] + ':' + morning_time[chat.id][1][1]
        }
    }

                        if (result.val().abonement.freeze_amount !== false && result.val().abonement.abonement_status !== abonement_statuses_text[1]){
                            temp_mes += `
❄️ Заморозок осталось: ` + result.val().abonement.freeze_amount

                            if (result.val().abonement.freeze_amount > 0 && result.val().abonement.abonement_status !== abonement_statuses_text[4] && result.val().abonement.abonement_status !== abonement_statuses_text[3] && result.val().abonement.abonement_status !== abonement_statuses_text[0]){
                                kb.push([{
                                    text: freezeabonement1_text[0],
                                    callback_data: freezeabonement1_text[1]
                                }])
                                user_freezeamount[chat.id] = result.val().abonement.freeze_amount
                            }
                        }

                        if (result.val().abonement.abonement_status === abonement_statuses_text[1]) {
                            
                            let freeze_date = new Date(result.val().abonement.freeze_start)
                            let minutes = freeze_date.getMinutes()
                            if (minutes < 10) minutes = '0' + minutes
                            let hours = freeze_date.getHours()
                            if (hours < 10) hours = '0' + hours

                            if ((result.val().abonement.freeze_amount - finaltime) < 0){
                                finaltime = 0
                            }
                            
                            temp_mes += `
❄️ Заморозок осталось: ` + (result.val().abonement.freeze_amount - finaltime).toString() + `
Абонемент в заморозке с ` + hours + ':' + minutes + ', ' + freeze_date.getDate() + '.' + (freeze_date.getMonth()+1).toString() + '.' + freeze_date.getFullYear()
                            
                            kb.push([{
                                text: unfreezeabonement1_text[0],
                                callback_data: unfreezeabonement1_text[1]
                            }])
                        }

                        if (result.val().coins > 0){
                            temp_mes += `
💰 Баланс: ` + result.val().coins + ` тенге`
                        }

                        user_email[chat.id] = result.val().email
                        user_phone[chat.id] = result.val().phone
                        user_name[chat.id] = result.val().name

                        let tmp_emj

                        if (user_email[chat.id] === 'unknown' || user_email[chat.id] === 'unknown' || user_phone[chat.id] === 'unknown'){
                            tmp_emj = '❗️ '
                        }

                        if (user_email[chat.id] !== 'unknown' && user_email[chat.id] !== 'unknown' && user_phone[chat.id] !== 'unknown'){
                            tmp_emj = '👤 '
                        }

                        kb.push([{
                            text: tmp_emj + adduserdata_text[0],
                            callback_data: adduserdata_text[1]
                        }])

                        kb.push([{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }])

                        messages_texts[chat.id][2] = temp_mes 
                        programme_pas[chat.id] = result.val().programme_pas
                        bot.sendMessage(chat.id, temp_mes, {
                            parse_mode: 'HTML',
                            reply_markup:{
                                inline_keyboard: kb
                            }
                        })
                        .then(res => {
                            messages_todelete[chat.id][3] = res.message_id
                        })
                    })
                    
                })
            }
        }

        if (query.data === adduserdata_text[1]){
            bot.editMessageText(messages_texts[chat.id][2], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: messages_todelete[chat.id][3]
            }).catch(err => {console.log('here: ' + err)})
            bot.sendMessage(chat.id, 'Укажите свои контакты, чтобы мы могли связаться с Вами, а также держали в курсе новых акций и событий 😏', {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backadduserdata_text[0],
                            callback_data: backadduserdata_text[1]
                        }],
                        [{
                            text: 'ФИО: ' + user_name[chat.id],
                            callback_data: adduserinfo_text[0]
                        },
                        {
                            text: 'Телефон: ' + user_phone[chat.id],
                            callback_data: adduserinfo_text[1]
                        }],
                        [{
                            text: 'Email: ' + user_email[chat.id],
                            callback_data: adduserinfo_text[2]
                        }]
                    ]
                }
            })
            .then(res => {
                messages_todelete[chat.id][4] = res.message_id
                messages_texts[chat.id][3] = res.text
            })
        }

        if (query.data === backadduserdata_text[1]){
            bot.deleteMessage(chat.id, messages_todelete[chat.id][4])
            .then(() => {
                messages_todelete[chat.id][4] = null
                bot.deleteMessage(chat.id, messages_todelete[chat.id][3])
                .then(() => {
                    messages_todelete[chat.id][3] = null
                    let abonem_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id)
                    abonem_data.get().then((result) => {
                        let date = new Date()
                        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                        let timeOfffset = 6 //Astana GMT +6
                        let time_now = new Date(utcTime + (3600000 * timeOfffset))
                        let Astana_date_end = new Date(result.val().abonement.end_date)  
                        let time_freeze = new Date(result.val().abonement.freeze_start)
                        
                        let minutes = Astana_date_end.getMinutes()
                        if (minutes < 10) minutes = '0' + minutes
                        let hours = Astana_date_end.getHours()
                        if (hours < 10) hours = '0' + hours
                        let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_end) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date_end.getDate() + '.' + (Astana_date_end.getMonth() + 1) + '.' + Astana_date_end.getFullYear()        

                        let finaltime = time_now.getTime() - time_freeze.getTime()
                        finaltime = finaltime / (1000 * 3600 * 24)
                        finaltime =  Math.round(finaltime)

                        if (time_now > Astana_date_end && result.val().abonement.abonement_status === abonement_statuses_text[2] ) {
                            StartTraining(chat.id, message_id)
                        }

                        let kb = []

                        let temp_mes = `<b>Ваш абонемент: </b>` + result.val().abonement.abonement_status + `

<b>Название программы:</b> ` + result.val().abonement.name + `
<b>Продолжительность: </b>` + result.val().abonement.period + ` мес.
<b>Стоимость: </b>` + result.val().abonement.price + ` тенге `

    temp_mes += `

📅 Абонемент годен до: ` + visible_date_end

if (time_now.getFullYear() === Astana_date_end.getFullYear() && time_now.getMonth() === Astana_date_end.getMonth() && time_now.getDate() <= Astana_date_end.getDate()){
    if ((Astana_date_end.getDate() - time_now.getDate()) <= 3){
        temp_mes +=  ` (❗️ Осталось ` + (Astana_date_end.getDate() - time_now.getDate()) + ` дн.)`
    }
}

kb.push([{
    text: continuemyabonement_text[0],
    callback_data: continuemyabonement_text[1]
},
{
    text: 'Сменить программу 🏋️‍♂️',
    callback_data: keyboards.main_menu_buttons[1][1]
}])

    if (result.val().abonement.visits !== 'unlimited'){
        temp_mes += `
👣 Посещений осталось: ` + result.val().abonement.visits
        if (result.val().abonement.visits <= 3){
            temp_mes += ` (❗️)`
        }
    }
    if (result.val().abonement.time !== 'unlimited'){
        if (result.val().abonement.time === 'evening'){
            temp_mes += `
🕔 Время: с ` + evening_time[chat.id][0][0] + ':' + evening_time[chat.id][0][1] + ' до ' +  evening_time[chat.id][1][0] + ':' + evening_time[chat.id][1][1]
        }
        if (result.val().abonement.time === 'morning'){
            temp_mes += `
🕔 Время: с ` + morning_time[chat.id][0][0] + ':' + morning_time[chat.id][0][1] + ' до ' +  morning_time[chat.id][1][0] + ':' + morning_time[chat.id][1][1]
        }
    }

                        if (result.val().abonement.freeze_amount !== false && result.val().abonement.abonement_status !== abonement_statuses_text[1]){
                            temp_mes += `
❄️ Заморозок осталось: ` + result.val().abonement.freeze_amount

                            if (result.val().abonement.freeze_amount > 0 && result.val().abonement.abonement_status !== abonement_statuses_text[4] && result.val().abonement.abonement_status !== abonement_statuses_text[3] && result.val().abonement.abonement_status !== abonement_statuses_text[0]){
                                kb.push([{
                                    text: freezeabonement1_text[0],
                                    callback_data: freezeabonement1_text[1]
                                }])
                                user_freezeamount[chat.id] = result.val().abonement.freeze_amount
                            }
                        }

                        if (result.val().abonement.abonement_status === abonement_statuses_text[1]) {
                            
                            let freeze_date = new Date(result.val().abonement.freeze_start)
                            let minutes = freeze_date.getMinutes()
                            if (minutes < 10) minutes = '0' + minutes
                            let hours = freeze_date.getHours()
                            if (hours < 10) hours = '0' + hours

                            if ((result.val().abonement.freeze_amount - finaltime) < 0){
                                finaltime = 0
                            }
                            
                            temp_mes += `
❄️ Заморозок осталось: ` + (result.val().abonement.freeze_amount - finaltime).toString() + `
Абонемент в заморозке с ` + hours + ':' + minutes + ', ' + freeze_date.getDate() + '.' + (freeze_date.getMonth()+1).toString() + '.' + freeze_date.getFullYear()
                            
                            kb.push([{
                                text: unfreezeabonement1_text[0],
                                callback_data: unfreezeabonement1_text[1]
                            }])
                        }

                        if (result.val().coins > 0){
                            temp_mes += `
💰 Баланс: ` + result.val().coins + ` тенге`
                        }

                        user_email[chat.id] = result.val().email
                        user_phone[chat.id] = result.val().phone
                        user_name[chat.id] = result.val().name

                        let tmp_emj

                        if (user_email[chat.id] === 'unknown' || user_email[chat.id] === 'unknown' || user_phone[chat.id] === 'unknown'){
                            tmp_emj = '❗️ '
                        }

                        if (user_email[chat.id] !== 'unknown' && user_email[chat.id] !== 'unknown' && user_phone[chat.id] !== 'unknown'){
                            tmp_emj = '👤 '
                        }

                        kb.push([{
                            text: tmp_emj + adduserdata_text[0],
                            callback_data: adduserdata_text[1]
                        }])

                        kb.push([{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }])

                        messages_texts[chat.id][2] = temp_mes 
                        programme_pas[chat.id] = result.val().programme_pas
                        bot.sendMessage(chat.id, temp_mes, {
                            parse_mode: 'HTML',
                            reply_markup:{
                                inline_keyboard: kb
                            }
                        })
                        .then(res => {
                            messages_todelete[chat.id][3] = res.message_id
                        })
                    })
                    
                })
            })
        }

        if (query.data === keyboards.main_menu_buttons[3][1]){
            bot.editMessageText(text, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log('here: ' + err)})
            let ppl_ingroup = fb.database().ref('Fitness/'+club_name_fb[chat.id] + '/shop')
            ppl_ingroup.get().then((snapshot) => {
                if (snapshot.exists()){
                    keyboards.ShopCategoriesKeyboard(shop_keyboard[chat.id], userShopCategories[chat.id], fb, bot, chat.id, backtomain_text, chooseshopcategory_text, club_name_fb[chat.id])
                }
                else {
                    bot.sendMessage(chat.id, 'Мы пока что не добавили товары в этот раздел, но скоро исправимся 😇', {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtomain_text,
                                    callback_data: backtomain_text
                                }]
                            ]
                        }
                    })
                }
            })
        }

        for (let i=0; i<userShopCategories[chat.id].length; i++){
            if (query.data === userShopCategories[chat.id][i]){
                userShopCategory[chat.id] = userShopCategories[chat.id][i]
                keyboards.ShopItemsKeyboard(shopitems_keyboard[chat.id], userItemsList[chat.id], userShopCategory[chat.id], fb, bot, chat, message_id, anothershopcategory_text, chooseitem_text, club_name_fb[chat.id])
            }
        }

        for (let i=0; i < 100; i++){
            //console.log(query.data + ', usershopcategory = ' + userShopCategory[chat.id])
            if (query.data === i.toString() && userShopCategory[chat.id] !== undefined && userShopCategory[chat.id] !== null /* && userItem[chat.id] === '' */) {
                console.log(query.data + ', usershopcategory = ' + userShopCategory[chat.id])
                userItem[chat.id] = i
                bot.deleteMessage(chat.id, message_id)
                let itemdata = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + query.data)
                itemdata.get().then((result) => {
                    let temp_text = `<b>`+ result.val().name + `</b>
` + result.val().description + `

💰 Цена: ` + result.val().price + ` тенге`
                    userItemPrice[chat.id] = result.val().price
                    if (userstatus[chat.id] === 'registered'){
                        bot.sendPhoto(chat.id, result.val().photo, {
                            parse_mode: 'HTML',
                            caption: temp_text,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: backtoitemslist_text[0],
                                        callback_data: backtoitemslist_text[1]
                                    }],
                                    [{
                                        text: buyitem_text[0],
                                        callback_data: buyitem_text[1]
                                    }]
                                ]
                            }
                        })
                    }
                    if (userstatus[chat.id] !== 'registered'){
                        bot.sendPhoto(chat.id, result.val().photo, {
                            parse_mode: 'HTML',
                            caption: temp_text,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: backtoitemslist_text[0],
                                        callback_data: backtoitemslist_text[1]
                                    }]
                                ]
                            }
                        })
                    }
                })
            }
        }

        if (query.data === buyitem_text[1]){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log(err)})
            let userdata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id)
            userdata.get().then((result) => {
                user_coins[chat.id] = result.val().coins
                if(user_coins[chat.id] >= (userItemPrice[chat.id] * min_cashback[chat.id]) && userItemPrice[chat.id] >= min_price[chat.id]){
                    if (user_coins[chat.id] > (userItemPrice[chat.id] * max_cashback[chat.id])){
                        skidka[chat.id] = userItemPrice[chat.id] * max_cashback[chat.id]
                    }
                    else skidka[chat.id] = user_coins[chat.id]

                    bot.sendMessage(chat.id, 'У вас есть ' + user_coins[chat.id] + ' тенге, их которых вы можете потратить ' + skidka[chat.id] + ' тенге на покупку этого товара. Хотите воспользоваться ими?', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: useskidka_text[0],
                                    callback_data: useskidka_text[1]
                                }],
                                [{
                                    text: dontuseskidka_text[0],
                                    callback_data: dontuseskidka_text[1]
                                }]
                            ]
                        }
                    })

                }
                else {
                    let itemdata = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + userItem[chat.id])
            itemdata.get().then((result) => {
                let billtext = `

<b>⏳ Запрос на покупку</b>
├ Клиент: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

<b>ℹ️ Информация о товаре</b>
├ Название: ` + result.val().name + `
├ Цена: ` + result.val().price + ` тенге
└ Клиент не использовал бонусы `

                bot.sendMessage(chat.id, 'Спасибо за покупку! Покажите это сообщение сотруднику клуба. После получения товара нажмите "✅ Товар получен"' + billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text:igotmyitem_text[0],
                                callback_data: query_deletethismessage
                            }]
                        ]
                    }
                })

                bot.sendMessage(operators_chat[chat.id], billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Товар выдан',
                                callback_data: 'bytm_' + userItem[chat.id] + '_' + result.val().name + '_' + result.val().price
                            }]
                        ]
                    }
                })
            })
                }
            })
        }

        if (query.data === dontuseskidka_text[1]){
            let itemdata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + userItem[chat.id])
            itemdata.get().then((result) => {
                let billtext = `

<b>⏳ Запрос на покупку</b>
├ Клиент: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

<b>ℹ️ Информация о товаре</b>
├ Название: ` + result.val().name + `
├ Цена: ` + result.val().price + ` тенге
└ Клиент не использовал бонусы `

                bot.sendMessage(chat.id, 'Спасибо за покупку! Покажите это сообщение сотруднику клуба. После получения товара нажмите "✅ Товар получен"' + billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text:igotmyitem_text[0],
                                callback_data: query_deletethismessage
                            }]
                        ]
                    }
                })

                bot.sendMessage(operators_chat[chat.id], billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Товар выдан',
                                callback_data: 'bytm_' + userItem[chat.id] + '_' + result.val().name + '_' + result.val().price
                            }]
                        ]
                    }
                })
            })
        }

        if (query.data === useskidka_text[1]){
            let itemdata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + userItem[chat.id])
            itemdata.get().then((result) => {
                let billtext = `

<b>⏳ Запрос на покупку</b>
├ Клиент: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

<b>ℹ️ Информация о товаре</b>
├ Название: ` + result.val().name + `
├ Цена: ` + result.val().price + ` тенге
└ Клиент использовал бонусы: ` + skidka[chat.id] + ` тенге

💰 Итоговая цена за товар: ` + (result.val().price - skidka[chat.id])

                bot.sendMessage(chat.id, 'Спасибо за покупку! Покажите это сообщение сотруднику клуба. После получения товара нажмите "✅ Товар получен"' + billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: igotmyitem_text[0],
                                callback_data: igotmyitem_text[1]
                            }]
                        ]
                    }
                })

                bot.sendMessage(operators_chat[chat.id], billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Товар выдан',
                                callback_data: 'bytm_' + userItem[chat.id] + '_' + result.val().name + '_' + result.val().price
                            }]
                        ]
                    }
                })
            })
        }

        if (query.data === sendlocation){
            const msgtext = `Отправьте нам свою локацию, и мы найдем ближайший <b>Coffee BOOM</b> ☕️. Для этого нажмите на иконку скрепки (слева снизу) и выберите <b>"Геопозиция"</b>
🏪 Вы также можете отметить заведение на карте`
            bot.sendVideo(chat.id, './pictures/tutorial.mp4').then(() => {
                bot.sendMessage(chat.id, msgtext, {parse_mode: 'HTML'})
            })
        }

        if (query.data === backtomain_text){
            if (userstatus[chat.id] !== 'registered'){
                IdentifyUser(chat.id, false)
            }
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                anotherpoint_multiple[chat.id] = 2
                bot.sendMessage(chat.id, hellomessage_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.main_menu_keyboard
                    }
                })
            })
            
        }

        for (let i = 0; i < userCategories[chat.id].length; i++){
            //console.log('categorycheck: ' + userCategories[chat.id][i])
            if (query.data === userCategories[chat.id][i] && userProgram[chat.id] === ''){
                userCategory[chat.id] = userCategories[chat.id][i]
                //user_mailingdata[chat.id][0] = userCategory[chat.id] 
                userProgram[chat.id] = 'unknown'
                console.log('PRESSED ON CATEGORY!!!')
                //bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
                keyboards.ProgramKeyboard(programmes_keyboard[chat.id], userProgrammesList[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, chooseprogramme_text, club_name_fb[chat.id])
            }
        }

        if (query.data === anothercategory_text){
            userCategory[chat.id] = ''
            userProgram[chat.id] = ''
            //user_mailingdata[chat.id][0] = ''
            bot.deleteMessage(chat.id, message_id)
            keyboards.ProgramCategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, backtomain_text, choosecategory_text, club_name_fb[chat.id])
        }

        if (query.data === anothershopcategory_text){
            userShopCategory[chat.id] = ''
            bot.deleteMessage(chat.id, message_id)
            keyboards.ShopCategoriesKeyboard(shop_keyboard[chat.id], userShopCategories[chat.id], fb, bot, chat.id, backtomain_text, chooseshopcategory_text, club_name_fb[chat.id])
        }

        if (query.data === backtoitemslist_text[1]){
            userItem[chat.id] = ''
            userItemPrice[chat.id] = 0
            bot.deleteMessage(chat.id, message_id)
            keyboards.ShopItemsKeyboard(shopitems_keyboard[chat.id], userItemsList[chat.id], userShopCategory[chat.id], fb, bot, chat, message_id, anothershopcategory_text, chooseitem_text, club_name_fb[chat.id])
        }

        for (let i = 0; i < temp_program_types[chat.id].length; i++){
            if (query.data === choosetype_callback + temp_program_types[chat.id][i][3]){
                    myprogram_type[chat.id] = temp_program_types[chat.id][i]
                    //user_mailingdata[chat.id][2] = temp_program_types[chat.id][i][2] //time
                   // user_mailingdata[chat.id][3] = temp_program_types[chat.id][i][0] //time

                    bot.editMessageCaption(messages_texts[chat.id][0], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: messages_todelete[chat.id][0]
                    })
                    .catch(err => {
                        console.log(err)
                        bot.editMessageText(messages_texts[chat.id][0], {
                            parse_mode: 'HTML',
                            chat_id: chat.id,
                            message_id: messages_todelete[chat.id][0]
                        })
                    })
                    /* for (let i = 0; i < messages_todelete[chat.id].length; i++){
                        console.log('why? ' + messages_todelete[chat.id].length)
                        bot.deleteMessage(chat.id, messages_todelete[chat.id][i])
                    } */
                    let texttosend = []
                    texttosend[chat.id] = `<b>Описание абонимента: </b>
⏳ Длительность тренировок: ` + temp_program_types[chat.id][i][0] + ` мес. 
`
                    if (temp_program_types[chat.id][i][4] !== 'unlimited'){
                        texttosend[chat.id] += `👣 Количество посещений: ` + temp_program_types[chat.id][i][4] + `
`
                    }
                    
                    if (temp_program_types[chat.id][i][2] === 'morning') {
                        texttosend[chat.id] += `🕓 Часы посещения: с ` + morning_time[chat.id][0][0] + ':' + morning_time[chat.id][0][1] + ' по ' + morning_time[chat.id][1][0] + ':' + morning_time[chat.id][1][1] + `
`
                    }

                    if (temp_program_types[chat.id][i][2] === 'evening') {
                        texttosend[chat.id] += `🕓 Часы посещения: с ` + evening_time[chat.id][0][0] + ':' + evening_time[chat.id][0][1] + ' по ' + evening_time[chat.id][1][0] + ':' + evening_time[chat.id][1][1] + `
`
                    }

                    let stringyy = programme_pas[chat.id]
                    stringyy = stringyy.split('/')

                    if (programdiscount[chat.id] !== 0 && stringyy[6] === userProgram[chat.id] && stringyy[8] === 'onetime'){
                        if ((parseInt(temp_program_types[chat.id][i][1]) * (programdiscount[chat.id] / 100)) <= discountvalues[chat.id][3]){
                            temp_program_types[chat.id][i][1] = temp_program_types[chat.id][i][1] - (parseInt(temp_program_types[chat.id][i][1]) * (programdiscount[chat.id] / 100))
                            texttosend[chat.id] += `💰 Цена абонемента: ` + temp_program_types[chat.id][i][1] + ` тенге (скидка `+ programdiscount[chat.id] +`%)`
                        }

                        else {
                            temp_program_types[chat.id][i][1] = temp_program_types[chat.id][i][1] - discountvalues[chat.id][3]
                            texttosend[chat.id] += `💰 Цена абонемента: ` + temp_program_types[chat.id][i][1] + ` тенге (с учетом скидки)`
                        }
                        
                    }

                    if (programdiscount[chat.id] === 0 || stringyy[6] !== userProgram[chat.id] || stringyy[8] !== 'onetime'){
                        texttosend[chat.id] += `💰 Цена абонемента: ` + temp_program_types[chat.id][i][1] + ` тенге`
                    }

                    if (temp_program_types[chat.id][i][5] !== false){
                        texttosend[chat.id] += `

<i>❄️ В абонемент входит возможность заморозки (`+ temp_program_types[chat.id][i][5] +` дн.) </i>`
                    }

                    if (temp_program_types[chat.id][i][5] === false){
                        texttosend[chat.id] += `

<i>❄️ В абонемент не входит возможность заморозки </i>`
                    }
                    types_keyboard[chat.id][2][0] = 
                    {
                        text: fillabonement_text,
                        callback_data: fillabonement_text + temp_program_types[chat.id][i][3]
                    }
                    if (messages_todelete[chat.id][1] !== undefined){
                        bot.editMessageText(texttosend[chat.id], {
                            parse_mode: 'HTML',
                            chat_id: chat.id,
                            message_id: messages_todelete[chat.id][1],
                            reply_markup: {
                                inline_keyboard: types_keyboard[chat.id]
                            }
                        }).catch(err => {console.log('2 ' + err)})
                        .then(res => {messages_texts[chat.id][1] = res.text})
                    }

                    if (messages_todelete[chat.id][1] === undefined){
                        bot.sendMessage(chat.id, texttosend[chat.id], {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: types_keyboard[chat.id]
                            }
                        }) 
                        .then(res => {
                            messages_todelete[chat.id][1] = res.message_id
                            messages_texts[chat.id][1] = res.text
                        })
                        .catch(err => {console.log('1 ' + err)})
                    }
                    
                    
            }
        }

    
    for (let i = 0; i < userProgrammesList[chat.id].length; i++){
        if (query.data === userProgrammesList[chat.id][i]){
            //console.log('Кнопку нашли')
            userProgram[chat.id] = userProgrammesList[chat.id][i]
         // user_mailingdata[chat.id][1] = userProgrammesList[chat.id][i]
            let program_photo_link = []
            program_photo_link[chat.id] = ''
            let program_description = []
            program_description[chat.id] = ''
            let program_peopleamount = []
            program_peopleamount[chat.id] = ''
            let program_trener_link = []
            program_trener_link[chat.id] = ''
            let program_trener_name = []
            program_trener_name[chat.id] = ''
            let program_name = []
            program_name[chat.id] = ''
            
            bot.deleteMessage(chat.id, message_id).then(() => {
                let prg_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/')
                prg_info.get().then((snapshot) =>
                {
                    program_photo_link[chat.id] = snapshot.val().photo_link

                    program_description[chat.id] = snapshot.val().description
                    program_name[chat.id] = snapshot.val().name
                    program_trener_link[chat.id] = snapshot.val().trener_link
                    program_trener_name[chat.id] = snapshot.val().trener_name

                    program_peopleamount[chat.id] = snapshot.val().people_in_group

                    let pamount_values = []
                    pamount_values[chat.id] = []

                    if (program_peopleamount[chat.id] !== 'unlimited') {
                        pamount_values[chat.id] = program_peopleamount[chat.id].split('/')
                        pamount_values[chat.id][0] = parseInt(pamount_values[chat.id][0])
                        pamount_values[chat.id][1] = parseInt(pamount_values[chat.id][1])
                    }

                    let types_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/types/')
                    types_info.get().then((snapshot) => {
                        let types_amount = []
                        types_amount[chat.id] = Object.keys(snapshot.val())
                        types_keyboard[chat.id] = [[],[], []]
                        types_keyboard[chat.id][0][0] = 
                        {
                            text: anotherprogram_text,
                            callback_data: anotherprogram_text
                        }
                        console.log(Object.keys(snapshot.val()))
                        for (let i = 0; i < types_amount[chat.id].length; i++){
                            let info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/types/' + types_amount[chat.id][i])
                            info.get().then((result) => {
                                temp_program_types[chat.id][i] = [result.val().period, result.val().price, result.val().time, result.val().type_name, result.val().visits, result.val().is_freeze, program_name[chat.id]] 
                                console.log(temp_program_types[chat.id][i])
                                if (pamount_values[chat.id][0] < pamount_values[chat.id][1] || program_peopleamount[chat.id] === 'unlimited') {
                                    types_keyboard[chat.id][1][i] = 
                                    {
                                        text: result.val().type_name,
                                        callback_data: choosetype_callback + result.val().type_name
                                    }
                                }
                                

                                if (i === types_amount[chat.id].length - 1){
                                    temp_progtypes_text[chat.id] = `<b>` + program_name[chat.id] + `</b>
` + program_description[chat.id]
                                    if (program_trener_link[chat.id] !== 'unknown' && program_trener_name[chat.id] !== 'unknown') {
                                        temp_progtypes_text[chat.id] += `
                                            
<b>Тренер: </b><a href="`+ program_trener_link[chat.id] +`">`+ program_trener_name[chat.id] + `</a>` 
                                    }
                                    if (program_trener_link[chat.id] === 'unknown' && program_trener_name[chat.id] !== 'unknown') {
                                        temp_progtypes_text[chat.id] += `
                                            
<b>Тренер: </b>`+ program_trener_name[chat.id] 
                                    }

                                    if (program_peopleamount[chat.id] !== 'unlimited'){
                                        temp_progtypes_text[chat.id] += `
                                    
<b>Записались:</b> ` + program_peopleamount[chat.id]
                                    }

                                    

                                    if (pamount_values[chat.id][0] < pamount_values[chat.id][1] ||  program_peopleamount[chat.id] === 'unlimited') {
                                        temp_progtypes_text[chat.id] += `
                                    
Выберите подходящий тип программы: `
                                    }

                                    if (pamount_values[chat.id][0] >= pamount_values[chat.id][1]) {
                                        favourite_program[chat.id] = myprogram_type[chat.id][6]
                                        /* if (waitlist[chat.id] === ''){
                                            waitlist[chat.id] = myprogram_type[chat.id][6]
                                            let wait_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/mailing/waitlist/programmes/' + myprogram_type[chat.id][6])
                                            wait_data.get().then((result) => {
                                                let local_waitlist = result.val()
                                                let lists_array = local_waitlist.split(',')
                                                for(let i = 0; i<lists_array; i++){
                                                    if (lists_array[i] === chat.id){
                                                        break
                                                    }
                                                    if (i === lists_array - 1 && lists_array[i] !== chat.id){
                                                        if (local_waitlist = '0'){
                                                            local_waitlist = (chat.id).toString()
                                                        }
                                                        if (local_waitlist !== '0'){
                                                            local_waitlist += ',' + chat.id
                                                        }
    
                                                        let updates = {}
                                                        updates['Fitness/'+club_name_fb[chat.id]+'/mailing/waitlist/programmes/' + myprogram_type[chat.id][6]] = local_waitlist
                                                        fb.database().ref().update(updates)
                                                    }
                                                }
                                            })
                                        } */
                                        
                                        temp_progtypes_text[chat.id] += `
                                    
<i>К сожалению, все места заняты</i> `
                                        types_keyboard[chat.id][1][0] = 
                                        {
                                            text: 'Оставить заявку',
                                            url: 'https://t.me/' + support_username[chat.id]
                                        }
                                    }
                                    
                                    if (program_photo_link[chat.id] !== 'unknown'){
                                        bot.sendPhoto(chat.id, program_photo_link[chat.id], {
                                            parse_mode: 'HTML',
                                            caption: temp_progtypes_text[chat.id],
                                            reply_markup:{
                                                inline_keyboard:types_keyboard[chat.id]
                                            }
                                        })
                                        .then(res => {
                                            messages_todelete[chat.id][0] = res.message_id
                                            messages_texts[chat.id][0] = res.caption
                                        })
                                        .catch(err => {console.log(err)})
                                    }

                                    if (program_photo_link[chat.id] === 'unknown'){
                                        bot.sendMessage(chat.id, temp_progtypes_text[chat.id], {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:types_keyboard[chat.id]
                                            }
                                        })
                                        .then(res => {
                                            messages_todelete[chat.id][0] = res.message_id
                                            messages_texts[chat.id][0] = res.caption
                                        })
                                        .catch(err => {console.log(err)})
                                    }
                                }
                            })
                        }
                    })

                }).catch((err) => {console.log(err)})
            })
        }
    }

        for (let i = 0; i < userTreners[chat.id].length; i++){
            if (query.data === userTreners[chat.id][i]){
                userTrener[chat.id] = userTreners[chat.id][i]

                bot.deleteMessage(chat.id, message_id).then(() => {
                    let prg_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/treners/' + userTreners[chat.id][i])
                    prg_info.get().then((snapshot) =>
                    {
                        let description = snapshot.val().description
                        let name = snapshot.val().name
                        let social_link = snapshot.val().social_link
                        let photo_link = snapshot.val().photo
                        
                        const texty = `<b>`+ name +`</b>
` + description

                        if (photo_link !== 'unknown'){
                            bot.sendPhoto(chat.id, photo_link, {
                                parse_mode: 'HTML',
                                caption: texty,
                                reply_markup:{
                                    inline_keyboard:[
                                        [{
                                            text: 'Узнать больше',
                                            url: social_link
                                        }],
                                        [{
                                            text: backtotreners_text[0],
                                            callback_data: backtotreners_text[1]
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                messages_todelete[chat.id][0] = res.message_id
                                messages_texts[chat.id][0] = res.caption
                            })
                            .catch(err => {console.log(err)})
                        }
                        
                        if (photo_link === 'unknown'){
                            bot.sendMessage(chat.id, texty, {
                                parse_mode: 'HTML',
                                reply_markup:{
                                    inline_keyboard:[
                                        [{
                                            text: 'Узнать больше',
                                            url: social_link
                                        }],
                                        [{
                                            text: backtotreners_text[0],
                                            callback_data: backtotreners_text[1]
                                        }]
                                    ]
                                }
                            })
                            .then(res => {
                                messages_todelete[chat.id][0] = res.message_id
                                messages_texts[chat.id][0] = res.caption
                            })
                            .catch(err => {console.log(err)})
                        }
    
                    }).catch((err) => {console.log(err)})
                })
            }
        }

    if (query.data === anotherprogram_text){
        userProgram[chat.id] = ''
      //  user_mailingdata[chat.id][1] = ''
      //  user_mailingdata[chat.id][2] = ''
//        user_mailingdata[chat.id][3] = ''
        bot.deleteMessage(chat.id, messages_todelete[chat.id][0]).catch(err => {console.log(err)})
        .then(() => {messages_todelete[chat.id][0] = undefined})
        if (messages_todelete[chat.id][1] !== null){
            console.log('!!')
            bot.deleteMessage(chat.id, messages_todelete[chat.id][1]).catch(err => {console.log(err)})
            .then(() => {messages_todelete[chat.id][1] = undefined})
        }
        keyboards.ProgramKeyboard(programmes_keyboard[chat.id], userProgrammesList[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, chooseprogramme_text, club_name_fb[chat.id])
        
    }
    if (query.data === backtotreners_text[1]){
        userTrener[chat.id] = ''
        bot.deleteMessage(chat.id, messages_todelete[chat.id][0]).catch(err => {console.log(err)})
        .then(() => {messages_todelete[chat.id][0] = undefined})
        if (messages_todelete[chat.id][1] !== null){
            console.log('!!')
            bot.deleteMessage(chat.id, messages_todelete[chat.id][1]).catch(err => {console.log(err)})
            .then(() => {messages_todelete[chat.id][1] = undefined})
        }
        keyboards.TrenersKeyboard(trener_keyboard[chat.id], userTreners[chat.id], fb, bot, chat.id, backtomain_text, choosetrener_text, club_name_fb[chat.id])        
    }
    if (query.data === fillabonement_text + myprogram_type[chat.id][3]){
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1]
        })
        CheckUser(chat.id, chat.first_name, chat.id, message_id)
    }
    if (query.data === backtofillinginfo_text[1]){
        bot.deleteMessage(chat.id, add_info_msg[chat.id])
        CheckUser(chat.id, chat.first_name, chat.id, message_id)
    }
    if (query.data === backtoprogramme_text[1]){
        console.log('14^ '  + add_info_msg[chat.id])
        bot.deleteMessage(chat.id, messages_todelete[chat.id][2]).catch(err => {console.log('124 ' + err)})
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: types_keyboard[chat.id]
            }
        })
    }
    if (query.data === backtochoosepaingmethod_text[1]){
        user_payingmethod[chat.id] = ''
        bot.editMessageText(dopblank_text, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtofillinginfo_text[0],
                        callback_data: backtofillinginfo_text[1]
                    }],
                    [{
                        text: user_payingmethods[0][0],
                        callback_data: user_payingmethods[0][1]
                    },
                    {
                        text: user_payingmethods[1][0],
                        callback_data: user_payingmethods[1][1]
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[chat.id] = message_id
            console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
        })
    }
    if (query.data === user_payingmethods[0][1]){
        user_payingmethod[chat.id] = user_payingmethods[0][0]
        let finaltext = card_instructions_text + `

<b>🧾 Ваш абонемент:</b> 
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Длительность: ` + myprogram_type[chat.id][0] + ` мес. 
└ Цена: ` + myprogram_type[chat.id][1] + ` тенге
                
<b>💳 Реквизиты:</b>`
        
        if (card_data[chat.id][0] !== 0 && card_data[chat.id][0] !== undefined && card_data[chat.id][0] !== 'unknown') {
            finaltext += `
├ KASPI номер: ` + card_data[chat.id][0]
        }
        
        if (card_data[chat.id][1] !== 0 && card_data[chat.id][1] !== undefined && card_data[chat.id][1] !== 'unknown'){
            finaltext += `
├ Карта: ` + card_data[chat.id][1]
        }
        
        finaltext += `
└ ФИО: ` + card_data[chat.id][2]

        bot.editMessageText(finaltext, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtochoosepaingmethod_text[0],
                        callback_data: backtochoosepaingmethod_text[1]
                    }],
                    [{
                        text: ihavepaid_text[0],
                        callback_data: dataiscorrect2_text
                    }]
                ]
            }
        })
    }
    if (query.data === user_payingmethods[1][1]){
        user_payingmethod[chat.id] = user_payingmethods[1][0]
        let finaltext = cash_instructions_text + `

<b>🧾 Ваш абонемент:</b> 
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Длительность: ` + myprogram_type[chat.id][0] + ` мес. 
└ Цена: ` + myprogram_type[chat.id][1] + ` тенге`

        bot.editMessageText(finaltext, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtochoosepaingmethod_text[0],
                        callback_data: backtochoosepaingmethod_text[1]
                    }],
                    [{
                        text: ihavepaid_text[0],
                        callback_data: ihavepaid_text[1]
                    }]
                ]
            }
        })
    }
    if (query.data === dataiscorrect2_text){
        bot.editMessageText('Вы уверены, что совершили оплату?', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtochoosepaingmethod_text[0],
                        callback_data: backtochoosepaingmethod_text[1]
                    }],
                    [{
                        text: 'Да, я оплатил',
                        callback_data: ihavepaid_text[1]
                    }]
                ]
            }
        })
    }
    if (query.data === ihavepaid_text[1]){
        favourite_program[chat.id] = myprogram_type[chat.id][6]
        //Создаем акк и отправляем чек в группу админов
        if (userstatus[chat.id] !== 'unregistered'){
            bot.deleteMessage(chat.id, message_id).then(() => 
            {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendChatAction(chat.id, 'upload_document')
                .catch(err => {console.log('24 ' + err)})
                
                let updates = {};
                
                let stringy = programme_pas[chat.id]
                stringy = stringy.split('/')
                
                if (stringy[4] === userCategory[chat.id] && stringy[6] === userProgram[chat.id]){
                    abonements_bill_topic = abonement_bill_topic_names[3]
                }

                if (stringy[4] !== userCategory[chat.id] || stringy[6] !== userProgram[chat.id]){
                    abonements_bill_topic = abonement_bill_topic_names[0]
                }

                //abonements_bill_topic = abonement_bill_topic_names[0]
                abonemets_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Срок действия: ` + myprogram_type[chat.id][0] + ` мес.
└ Стоимость: ` + myprogram_type[chat.id][1] + `  тенге.

`

if (myprogram_type[chat.id][2] === 'unlimited'){
    abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
}

if (myprogram_type[chat.id][2] !== 'unlimited'){
    if (myprogram_type[chat.id][2] === 'morning'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[chat.id][0][0] + `:` + morning_time[chat.id][0][1] + ` до ` + morning_time[chat.id][1][0] + `:` + morning_time[chat.id][1][1] 
    }

    if (myprogram_type[chat.id][2] === 'evening'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[chat.id][0][0] + `:` + evening_time[chat.id][0][1] + ` до ` + evening_time[chat.id][1][0] + `:` + evening_time[chat.id][1][1] 
    }
}

if (myprogram_type[chat.id][4] === 'unlimited'){
    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
}

if (myprogram_type[chat.id][4] !== 'unlimited'){
    abonements_bill_order_info += `
├ Кол-во посещений: ` + myprogram_type[chat.id][4]
}

if (myprogram_type[chat.id][5] === false){
    abonements_bill_order_info += `
└ Нет функции заморозки`
}

if (myprogram_type[chat.id][5] !== false){
    abonements_bill_order_info += `
└ Кол-во заморозок: ` + myprogram_type[chat.id][5] + ` дней.`
}

    console.log('order_date! ' + order_date[chat.id])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info
    //console.log('last message id: ' + query.message.message_id)
    programme_pas[chat.id] = 'Fitness/' + club_name_fb[chat.id] + '/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id]
    let username = []
    username[chat.id] = "undefined"
    if (chat.username != undefined) username[chat.id] = chat.username.toString()

    if (stringy[4] === userCategory[chat.id] && stringy[6] === userProgram[chat.id]){
        user_mailingdata[chat.id][0] = userCategory[chat.id]
        user_mailingdata[chat.id][1] = userProgram[chat.id]
        user_mailingdata[chat.id][2] = myprogram_type[chat.id][2]
        user_mailingdata[chat.id][3] = myprogram_type[chat.id][0]
        let abone = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/abonement');
        abone.get().then((snapshot) => {
            let date = new Date()
            let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
            let timeOfffset = 6 //Astana GMT +6
            let time_now = new Date(utcTime + (3600000 * timeOfffset))

            time_now.setMonth(time_now.getMonth() +  myprogram_type[chat.id][0], date.getDate())
            updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/abonement/period'] = myprogram_type[chat.id][0]
            //updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/abonement/end_date'] = time_now.getTime()
            updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/abonement/abonement_status'] = abonement_statuses_text[0]
            updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/programme_pas'] = programme_pas[chat.id]

            fb.database().ref().update(updates)
            
            order_name[chat.id] = 'Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id
            console.log('ORDER NAME: ' + order_name[chat.id])    
            userstatus[chat.id] = 'registered'
            StartCheckingOrder(chat.id)

            let pp_group = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/people_in_group');
            pp_group.get().then((snapshot) => {
                if (snapshot.exists() && snapshot.val() !== 'unlimited'){
                    let tmp_ar = snapshot.val()
                    tmp_ar = tmp_ar.split('/')
                    tmp_ar = (parseInt(tmp_ar[0]) - 1).toString() + '/' + tmp_ar[1]
                    console.log('ДОБАВЛЯЕМ НОВОГО УЧАСТНИКА ПРОГРАММЫ. ТЕПЕРЬ: tmp_ar')
                    let updates2 = {}
                    updates2['Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/people_in_group'] = tmp_ar
                    fb.database().ref().update(updates2)
                }
            })
        })
    }

    if (stringy[4] !== userCategory[chat.id] || stringy[6] !== userProgram[chat.id]){
        DeleteMailingData(chat.id)
        AddMailingData(chat.id, true)
        let newabonement = 
        {
            name: myprogram_type[chat.id][6],
            time: myprogram_type[chat.id][2],
            visits: myprogram_type[chat.id][4],
            freeze_amount: myprogram_type[chat.id][5],
            period: myprogram_type[chat.id][0],
            price: myprogram_type[chat.id][1],
            freeze_start: '0',
            start_date: '0',
            end_date: '0',
            abonement_status: abonement_statuses_text[0],
            activator_name: 'unknown',
            activator_id: 'unknown',
            paying_method: user_payingmethod[chat.id]
        }
        updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/abonement'] = newabonement
        updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/favourite_program'] = myprogram_type[chat.id][6]
        updates['Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id + '/programme_pas'] = programme_pas[chat.id]
        fb.database().ref().update(updates)
        order_name[chat.id] = 'Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id
        console.log('ORDER NAME: ' + order_name[chat.id])

        let pp_group = fb.database().ref(programme_pas[chat.id] + '/people_in_group');
            pp_group.get().then((snapshot) => {
                if (snapshot.exists() && snapshot.val() !== 'unlimited'){
                    let tmp_ar = snapshot.val()
                    tmp_ar = tmp_ar.split('/')
                    tmp_ar = (parseInt(tmp_ar[0]) - 1).toString() + '/' + tmp_ar[1]
                    console.log('ДОБАВЛЯЕМ НОВОГО УЧАСТНИКА ПРОГРАММЫ. ТЕПЕРЬ: tmp_ar')
                    let updates2 = {}
                    updates2[programme_pas[chat.id] + '/people_in_group'] = tmp_ar
                    fb.database().ref().update(updates2)
                }
            })
    
        userstatus[chat.id] = 'registered'
        StartCheckingOrder(chat.id)
    }

    //AddMailingData()

    let motherbase = fb.database().ref('Motherbase/clients/' + chat.id)
    motherbase.get().then((result) => {
        let motherbase_update = {}
        if (result.exists()){
            let fintesspart_user = {
                favourite_program: myprogram_type[chat.id][6],
                time: myprogram_type[chat.id][2],
                price: myprogram_type[chat.id][1],
                start_date: '0',
                end_date: '0',
                abonement_status: abonement_statuses_text[0],
                paying_method: user_payingmethod[chat.id]
            }

            motherbase_update['Motherbase/clients/' + chat.id + '/fitness'] = fintesspart_user
        
        }
        fb.database().ref().update(motherbase_update)
    })

    console.log('delivery_chat: ' + operators_chat[chat.id])
    let cr_chat = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/chats/');
    cr_chat.get().then((snapshot) => {
        operators_chat[chat.id] = snapshot.val().operators_chat
        console.log('IT WORKS: ' + operators_chat[chat.id])

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Создать абонемент',
                        callback_data: accept_order_callback + chat.id
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + chat.id
                    }]
                ]
            }
        }).then(() => {
            bot.sendMessage(chat.id, '⏳ Заявка на абонемент отправлена. В скором времени на нее ответит наш сотрудник', {
                
            })
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
        }

        else {
            bot.deleteMessage(chat.id, message_id).then(() => 
            {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendChatAction(chat.id, 'upload_document')
                .catch(err => {console.log('24 ' + err)})
                
                let updates = {};

/*                 let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                
 */
               

                ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    
/* let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
*/

if (programdiscount[chat.id] !== 0 &&  programdiscount[chat.id] !== undefined) {
    abonements_bill_topic = `Конверсия из пробной тренировки!
    
`
    abonements_bill_topic += abonement_bill_topic_names[0]
    let anal = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/analytics')
    anal.get().then((an) =>{
        let mini_update = {}
        mini_update['Fitness/' + club_name_fb[chat.id] + '/analytics/current_data/audience/conversions/converted'] = (an.val().current_data.audience.conversions.converted + 1)
        mini_update['Fitness/' + club_name_fb[chat.id] + '/analytics/alltime_data/net_conversions'] = (an.val().alltime_data.net_conversions + 1)
        fb.database().ref().update(mini_update)
    })
}

if (programdiscount[chat.id] === 0 ||  programdiscount[chat.id] === undefined) {
    abonements_bill_topic = abonement_bill_topic_names[0]
}
    abonemets_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Срок действия: ` + myprogram_type[chat.id][0] + ` мес.
└ Стоимость: ` + myprogram_type[chat.id][1] + `  тенге.`

if (programdiscount[chat.id] !== 0 &&  programdiscount[chat.id] !== undefined) {
    abonements_bill_order_info += ` (с учетом скидки `+ programdiscount[chat.id] +`%)
    
`
}

if (programdiscount[chat.id] === 0 ||  programdiscount[chat.id] === undefined){
    abonements_bill_order_info += `

`
}

if (myprogram_type[chat.id][2] === 'unlimited'){
    abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
}

if (myprogram_type[chat.id][2] !== 'unlimited'){
    if (myprogram_type[chat.id][2] === 'morning'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[chat.id][0][0] + `:` + morning_time[chat.id][0][1] + ` до ` + morning_time[chat.id][1][0] + `:` + morning_time[chat.id][1][1] 
    }

    if (myprogram_type[chat.id][2] === 'evening'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[chat.id][0][0] + `:` + evening_time[chat.id][0][1] + ` до ` + evening_time[chat.id][1][0] + `:` + evening_time[chat.id][1][1] 
    }
}

if (myprogram_type[chat.id][4] === 'unlimited'){
    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
}

if (myprogram_type[chat.id][4] !== 'unlimited'){
    abonements_bill_order_info += `
├ Кол-во посещений: ` + myprogram_type[chat.id][4]
}

if (myprogram_type[chat.id][5] === false){
    abonements_bill_order_info += `
└ Нет функции заморозки`
}

if (myprogram_type[chat.id][5] !== false){
    abonements_bill_order_info += `
└ Кол-во заморозок: ` + myprogram_type[chat.id][5] + ` дней.`
}

    user_mailingdata[chat.id][0] = userCategory[chat.id]
    user_mailingdata[chat.id][1] = userProgram[chat.id]
    user_mailingdata[chat.id][2] = myprogram_type[chat.id][2]
    user_mailingdata[chat.id][3] = myprogram_type[chat.id][0]
    console.log('order_date! ' + order_date[chat.id])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info
    //console.log('last message id: ' + query.message.message_id)
    programme_pas[chat.id] = 'Fitness/' + club_name_fb[chat.id] + '/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id]
    let username = []
    username[chat.id] = "undefined"
    if (chat.username != undefined) username[chat.id] = chat.username.toString()

    let newuser = {
        coins: user_coins[chat.id],
        email: user_email[chat.id],
        favourite_program: favourite_program[chat.id],
        id: chat.id,
        name: user_name[chat.id],
        phone: user_phone[chat.id],
        username: username[chat.id],
        abonements_bought: abonements_bought[chat.id],
        times_came: user_timescame[chat.id],
        bill_text: abonements_bill,
        bill_msg: 0,
        programme_pas: programme_pas[chat.id],
        abonement: {
            name: myprogram_type[chat.id][6],
            time: myprogram_type[chat.id][2],
            visits: myprogram_type[chat.id][4],
            freeze_amount: myprogram_type[chat.id][5],
            period: myprogram_type[chat.id][0],
            price: myprogram_type[chat.id][1],
            freeze_start: '0',
            start_date: '0',
            end_date: '0',
            abonement_status: abonement_statuses_text[0],
            activator_name: 'unknown',
            activator_id: 'unknown',
            paying_method: user_payingmethod[chat.id]
        }
    }

    order_name[chat.id] = 'Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id
    console.log('ORDER NAME: ' + order_name[chat.id])

    userstatus[chat.id] = 'registered'
    updates[order_name[chat.id]] = newuser

    fb.database().ref().update(updates)
    StartCheckingOrder(chat.id)
    AddMailingData(chat.id, true)

    let motherbase = fb.database().ref('Motherbase/clients/' + chat.id)
    motherbase.get().then((result) => {
        let motherbase_update = {}
        if (result.exists()){
            let fintesspart_user = {
                favourite_program: favourite_program[chat.id],
                time: myprogram_type[chat.id][2],
                price: myprogram_type[chat.id][1],
                start_date: '0',
                end_date: '0',
                abonement_status: abonement_statuses_text[0],
                paying_method: user_payingmethod[chat.id]
            }
            motherbase_update['Motherbase/clients/' + chat.id + '/name'] = user_name[chat.id]
            motherbase_update['Motherbase/clients/' + chat.id + '/phone'] = user_phone[chat.id]
            motherbase_update['Motherbase/clients/' + chat.id + '/username'] = username[chat.id]

            motherbase_update['Motherbase/clients/' + chat.id + '/fitness'] = fintesspart_user
        
        }
        else {
            let newmotherbase_user = {
                email: user_email[chat.id],           
                id: chat.id,
                name: user_name[chat.id],
                phone: user_phone[chat.id],
                username: username[chat.id],
                adress: 'unknown',
                sex: 'unknown',
                age: 'unknown',
                soc_stat: 'unknown',
                fitness: {
                    favourite_program: favourite_program[chat.id],
                    time: myprogram_type[chat.id][2],
                    price: myprogram_type[chat.id][1],
                    start_date: '0',
                    end_date: '0',
                    abonement_status: abonement_statuses_text[0],
                    paying_method: user_payingmethod[chat.id]
                }
            }
            motherbase_update['Motherbase/clients/' + chat.id] = newmotherbase_user
        }
        fb.database().ref().update(motherbase_update)
    })

    console.log('delivery_chat: ' + operators_chat[chat.id])
    let cr_chat = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/chats/');
    cr_chat.get().then((snapshot) => {
        operators_chat[chat.id] = snapshot.val().operators_chat
        console.log('IT WORKS: ' + operators_chat[chat.id])

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Создать абонемент',
                        callback_data: accept_order_callback + chat.id
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + chat.id
                    }]
                ]
            }
        }).then(() => {
            bot.sendMessage(chat.id, abonementrequest_sended)
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
        }
    }
    if (query.data === accepttraining_text[1]){
        bot.deleteMessage(chat.id, message_id)
        StartTraining(chat.id, message_id)
    }
    if (query.data === refusetraining_text[1]){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chat.id, message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
        .then(() => {
            anotherpoint_multiple[chat.id] = 2
            bot.sendMessage(chat.id, hellomessage_text, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: keyboards.main_menu_keyboard
                }
            })
            .then(() => {
                IdentifyUser(chat.id, false)
            })
        })
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
            userProgram[chat.id] = ''
            keyboards.ProgramKeyboard(programmes_keyboard[chat.id], userProgrammesList[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, chooseprogramme_text, club_name_fb[chat.id])

        //bot.deleteMessage(chat.id, message_id - 1)
    }
    if (query.data === addto_basket_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }) //убираем клаву в описании блюда
        for (let i = 0; i < basket[chat.id].length; i++){
            console.log('!!!! ' + basket[chat.id][i][0] + ' ' + userProgrammesList[chat.id][userProgram[chat.id]])
            if (basket[chat.id][i][0] === userProgrammesList[chat.id][userProgram[chat.id]]){

                bot.sendMessage(chat.id, chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_program_types[chat.id] + 'тг.'), {
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
            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userProgrammesList[chat.id][userProgram[chat.id]]){
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
                bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id] + 'тг.'), {
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
            bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id] + 'тг.'), {
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
                console.log('226 ' + basket[chat.id][i][0] + ' ' + userProgrammesList[chat.id][userProgram[chat.id]])
                if (basket[chat.id][i][0] === userProgrammesList[chat.id][userProgram[chat.id]]){
                    basket[chat.id][i][1]++
                    console.log('increasing existing food postion +1 ' + basket[chat.id][i][1])
                    bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_program_types[chat.id]) + 'тг.', {
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
                if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userProgrammesList[chat.id][userProgram[chat.id]]){
                    console.log('227 ' + basket[chat.id][i][0] + ' ' + userProgrammesList[chat.id][userProgram[chat.id]])
                    temp_foodamount[chat.id]++
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
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
                bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
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
                if (basket[chat.id][i][0] === userProgrammesList[chat.id][userProgram[chat.id]]){
                    if (basket[chat.id][i][1] > 1){
                        basket[chat.id][i][1]--
                        bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_program_types[chat.id]) + 'тг.', {
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
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
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
                    bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
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
            if (userProgrammesList[chat.id][userProgram[chat.id]] === basket[chat.id][i][0]){
                basket[chat.id].splice(i, 1)
                console.log('DELETED')
                //тут можно выводить список если удаляем предмет, а если еще не добавляли то нет
            }
        }
        bot.deleteMessage(chat.id, message_id).then(() => {
            bot.editMessageText(temp_progtypes_text[chat.id], {
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
                            text: anotherprogram_text,
                            callback_data: anotherprogram_text
                        }]
                    ]
                }
            })
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
        bot.editMessageText('🙂 Введите свое имя, оно будет указано на абонементе:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
        .then(res => 
            {
                add_info_msg[chat.id] = res.message_id
                messages_todelete[chat.id][2] = res.message_id
            })
    }
    if (query.data === changephone_text){
        isMakingChanges[chat.id] = 2
        bot.editMessageText('📞 Введите свой номер, мы свяжемся с Вами если это потребуется:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
        .then(res => 
            {
                add_info_msg[chat.id] = res.message_id
                messages_todelete[chat.id][2] = res.message_id
            })
    }
    if (query.data === dataiscorrect_text){
        isMakingChanges[chat.id] = 0
        bot.editMessageText(dopblank_text, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtofillinginfo_text[0],
                        callback_data: backtofillinginfo_text[1]
                    }],
                    [{
                        text: user_payingmethods[0][0],
                        callback_data: user_payingmethods[0][1]
                    }],
                    [{
                        text: user_payingmethods[1][0],
                        callback_data: user_payingmethods[1][1]
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[chat.id] = message_id
            console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
        })
    }
    if (query.data === adduserinfo_text[0]){
        isMakingChanges_2[chat.id] = 1
        bot.editMessageText('🙂 Введите свое имя, оно будет указано на абонементе:', {
            chat_id: chat.id, 
            message_id: messages_todelete[chat.id][4],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtoadduserinfo_text[0],
                        callback_data: backtoadduserinfo_text[1]
                    }]
                ]
            }
        })
        .catch(err => {console.log(err)})
    }
    if (query.data === adduserinfo_text[1]){
        isMakingChanges_2[chat.id] = 2
        bot.deleteMessage(chat.id, messages_todelete[chat.id][4])
        bot.sendPhoto(chat.id, openkeyboard_pic, {
            parse_mode: 'HTML',
            caption: 'Чтобы добавить номер, нажмите на появившуюся снизу кнопку "📞 Отправить номер". Если кнопки нет, нажмите на квадратный значок в нижнем правом углу клавиатуры (как на картинке)',
            reply_markup: {
                keyboard: [
                    [{
                        text: '📞 Отправить номер',
                        request_contact: true
                    }],
                    [{
                        text: backtoadduserinfo_text[0]
                    }]
                ],
                resize_keyboard: true
            }
        })
        .then(res => {
            messages_todelete[chat.id][4] = res.message_id
        })
    }
    if (query.data === adduserinfo_text[2]){
        isMakingChanges_2[chat.id] = 3
        bot.editMessageText('📧 Укажите свой email, чтобы наш клуб мог отправлять Вам сообщения с новостями об акциях и других мероприятиях. Обещаем - без спама 🙂', {
            chat_id: chat.id, 
            message_id: messages_todelete[chat.id][4],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtoadduserinfo_text[0],
                        callback_data: backtoadduserinfo_text[1]
                    }]
                ]
            }
        })
        .catch(err => {console.log(err)})
    }

    if (query.data === backtoadduserinfo_text[1]){
        isMakingChanges_2[chat.id] = 0
        bot.editMessageText(messages_texts[chat.id][3], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][4],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backadduserdata_text[0],
                        callback_data: backadduserdata_text[1]
                    }],
                    [{
                        text: 'ФИО: ' + user_name[chat.id],
                        callback_data: adduserinfo_text[0]
                    },
                    {
                        text: 'Телефон: ' + user_phone[chat.id],
                        callback_data: adduserinfo_text[1]
                    }],
                    [{
                        text: 'Email: ' + user_email[chat.id],
                        callback_data: adduserinfo_text[2]
                    }]
                ]
            }
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
            updates['Basement/clients/' + chat.id + '/coins'] = user_coins[chat.id]
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
                        chat_id: operators_chat[chat.id],
                        message_id: snapshot.val().message_id
                    })
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                    IdentifyUser(chat.id, false)
                    anotherpoint_multiple[chat.id] = 2
                    //keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chat.id], userPoint[chat.id], user_mode[chat.id])
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: usermodes[0][0],
                                    callback_data: usermodes[0][1]
                                },
                                {
                                    text: usermodes[1][0],
                                    callback_data: usermodes[1][1]
                                }]
                            ]
                        }
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

    //////////////////////////////РАССЫЛКИ///////////////////////////
    if (query.data === keyboards.admin_menu_buttons[1][1]){//открываем рассылку
        bot.editMessageText(messages_texts[chat.id][0], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][0]
        })
        .then(() => {
            bot.sendMessage(chat.id, 'Вы можете послать сообщение либо всем сразу, либо определенной группе:', {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: mailing_buttons[3][0],
                            callback_data: mailing_buttons[3][1]
                        },
                        {
                            text: '🗣 Послать всем',
                            callback_data: mailing_modes[0]
                        }],
                        [{
                            text: mailing_buttons[0][0],
                            callback_data: mailing_buttons[0][1]
                        },
                        {
                            text: mailing_buttons[1][0],
                            callback_data: mailing_buttons[1][1]
                        }],
                        [{
                            text: mailing_buttons[2][0],
                            callback_data: mailing_buttons[2][1]
                        }]
                    ]
                }
            })
            .then(res => {
                messages_todelete[chat.id][1] = res.message_id
                messages_texts[chat.id][1] = res.text
            })
        })
    }
    if (query.data === mailing_buttons[3][1]){//откатываем на главную
        bot.deleteMessage(chat.id, messages_todelete[chat.id][1])
        bot.editMessageText(messages_texts[chat.id][0], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][0],
            reply_markup: {
                inline_keyboard: keyboards.admin_menu_keyboard
            }
        })
    }
    if (query.data === mailing_buttons[1][1]){//Отправка по времени
        bot.editMessageText('Выберите, кому именно отправить сообщение: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: mailing_time[2][0],
                        callback_data: mailing_time[2][1]
                    }],
                    [{
                        text: mailing_time[0][0],
                        callback_data: mailing_time[0][1]
                    },
                    {
                        text: mailing_time[1][0],
                        callback_data: mailing_time[1][1]
                    }],
                ]
            }
        })
    }
    if (query.data === mailing_time[2][1]){//откатываем к рассылкам с времени
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: mailing_buttons[3][0],
                        callback_data: mailing_buttons[3][1]
                    },
                    {
                        text: 'Послать всем',
                        callback_data: mailing_modes[0]
                    }],
                    [{
                        text: mailing_buttons[0][0],
                        callback_data: mailing_buttons[0][1]
                    },
                    {
                        text: mailing_buttons[1][0],
                        callback_data: mailing_buttons[1][1]
                    }],
                    [{
                        text: mailing_buttons[2][0],
                        callback_data: mailing_buttons[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === mailing_time[0][1]){//выбрали утро 
        isMailingMessage[chat.id] = 1
        bot.editMessageText('Напишите сообщение для рассылки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: mailing_buttons[1][1]
                    }]
                ]
            }
        })
    }
    if (query.data === mailing_time[1][1]){//выбрали вечер 
        isMailingMessage[chat.id] = 2
        bot.editMessageText('Напишите сообщение для рассылки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: mailing_buttons[1][1]
                    }]
                ]
            }
        })
    }
    if (query.data === mailing_modes[0]){//отправляем всем
        isMailingMessage[chat.id] = 3
        bot.editMessageText('Напишите сообщение для рассылки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: mailing_time[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === mailing_buttons[2][1]){//отправляем по периодам
        let mail = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/mailing/period/')
        mail.get().then(result => {
            let arr = Object.keys(result.val())
            let kb = []
            kb[0] = [{
                text: mailing_time[2][0],
                callback_data: mailing_time[2][1]
            }]
            kb[1] = []
            for (let i = 0; i<arr.length; i++){
                kb[1][i]/* [i] */ = {
                    text: arr[i],
                    callback_data: mailing_modes[3] + arr[i]
                }
                if (i === arr.length - 1){
                    bot.editMessageText('Выберите нужный срок абонемента: ', {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: messages_todelete[chat.id][1],
                        reply_markup: {
                            inline_keyboard: kb
                        }
                    })
                }
            }
        })
    }
    if (query.data.includes(mailing_modes[3])){
        mailing_mode[chat.id] = query.data.split(mailing_modes[3])
        mailing_mode[chat.id] = mailing_mode[chat.id][1]
        console.log(mailing_mode[chat.id])
        isMailingMessage[chat.id] = 4
        bot.editMessageText('Напишите сообщение для рассылки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: mailing_buttons[2][1]
                    }]
                ]
            }
        })
    }
    if (query.data === mailing_buttons[0][1]){//парсим категории рассылок
        let categ = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/mailing/categories/')
        categ.get().then(result => {
            let arr = Object.keys(result.val())
            console.log(arr)
            let kb = []
            kb[0] = [{
                text: '◀️ Назад',
                callback_data: mailing_time[2][1]
            }]
            for(let i = 0; i< arr.length; i++){
                let names = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/mailing/categories/' + arr[i])
                names.get().then(result => {
                    kb[i+1] = [{
                        text: result.val().category_name,
                        callback_data: 'mailcat_' + arr[i]
                    }]

                    if (i === arr.length - 1){
                        console.log(kb)
                        bot.editMessageText('Выберите категорию: ', {
                            parse_mode: 'HTML',
                            chat_id: chat.id,
                            message_id: messages_todelete[chat.id][1],
                            reply_markup: {
                                inline_keyboard: kb
                            }
                        })
                    }
                })
                
            }
        })
    }
    if (query.data.includes('mailcat_')){
        let cat_name = query.data.split('_')
        cat_name = cat_name[1]
        let categ = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/mailing/categories/' + cat_name)
        categ.get().then(result => {
            let arr = Object.keys(result.val())
            let kb = []
            for(let i = 0; i< arr.length; i++){
                let names = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/mailing/categories/'+ cat_name +'/' + arr[i])
                names.get().then(result => {
                    kb[i] = [{
                        text: result.val().name,
                        callback_data: 'mailprog_' + cat_name + '_' + arr[i]
                    }]
                    if (arr[i] === 'category_name'){
                        kb[i] = [{
                            text: '◀️ Назад',
                            callback_data: mailing_time[2][1]
                        }]
                    }

                    if (i === arr.length - 1){
                        console.log(kb)
                        bot.editMessageText('Выберите программу: ', {
                            parse_mode: 'HTML',
                            chat_id: chat.id,
                            message_id: messages_todelete[chat.id][1],
                            reply_markup: {
                                inline_keyboard: kb
                            }
                        })
                    }
                })
                
            }
        })
    }
    if (query.data.includes('mailprog_')){
        mailing_mode[chat.id] = query.data
        isMailingMessage[chat.id] = 5
        bot.editMessageText('Напишите сообщение для рассылки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: mailing_time[2][1]
                    }]
                ]
            }
        })

    }
    if (query.data === sendmessage_cb){
        StartMailing(mailing_mode[chat.id], mailing_text[chat.id], chat.id)
        bot.deleteMessage(chat.id, messages_todelete[chat.id][0])
        .then(() => {
            bot.editMessageText('Рассылка запущена! Чем еще займемся? 😏', {
                chat_id: chat.id,
                message_id: messages_todelete[chat.id][1],
                reply_markup: {
                    inline_keyboard: keyboards.admin_menu_keyboard
                }
            })
            .then(res => {
                messages_todelete[chat.id][0] = res.message_id
                messages_todelete[chat.id][1] = null
            })
        })
    }
    /////////////////////////////////////////////////////////////////////////////
    ////////////////////////НАСТРОЙКИ///////////////////////////////////////////
    //САППОРТ
    if (query.data === keyboards.admin_menu_buttons[4][1]){
        var other_data = fb.database().ref('Motherbase/contacts')
        other_data.get().then((snapshot) => {
            bot.sendMessage(chat.id, `Возникли проблемы? Свяжитесь с нами и мы поможем в кратчайшие сроки ⌚️ 
Email: `+ snapshot.val().email + `
Телефон: ` + snapshot.val().phone + `
Аккаунт в телеграме: ` + snapshot.val().tgusername, {
        parse_mode: 'HTML', })
        })
    }
    //КАРТА
    if (query.data ===  keyboards.admin_menu_buttons[0][1]){
        bot.editMessageText(messages_texts[chat.id][0], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][0]
        })
        .then(() => {
            var other_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/other_info')
            other_data.get().then((snapshot) => 
            {
                help_phone[chat.id] = snapshot.val().contact_phone
                point_location[chat.id][0] = snapshot.val().latitude
                point_location[chat.id][1] = snapshot.val().longitude
                point_adress[chat.id] = snapshot.val().adress_text
        
                morning_time[chat.id] = snapshot.val().morning_time
        
                evening_time[chat.id] = snapshot.val().evening_time
        
                support_username[chat.id] = snapshot.val().support_username
        
                card_data[chat.id][0] = snapshot.val().kaspi_phone
                card_data[chat.id][1] = snapshot.val().card
                card_data[chat.id][2] = snapshot.val().fio
        
            })
            bot.sendMessage(chat.id, 'В этом разделе Вы можете изменять настройки бота и менять свои данные', {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: keyboards.admin_preferences_keyboard
                }
            })
            .then(res => {
                messages_todelete[chat.id][1] = res.message_id
                messages_texts[chat.id][1] = res.text
            })
        })
    }
    if (query.data === keyboards.admin_preferences_buttons[6][1]){
        bot.deleteMessage(chat.id, messages_todelete[chat.id][1])
        bot.editMessageText(messages_texts[chat.id][0], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][0],
            reply_markup: {
                inline_keyboard: keyboards.admin_menu_keyboard
            }
        })
        .then(res => {
            messages_todelete[chat.id][1] = null
            messages_texts[chat.id][1] = null
        })
        
    }
    if (query.data === keyboards.admin_preferences_buttons[1][1]){
        
        bot.editMessageText('Указанные ниже данные используют Ваши клиенты при оплате абонементов и других товаров.', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_cards[0][0] + ': ' + card_data[chat.id][1],
                        callback_data: keyboard_admin_cards[0][1]
                    }],
                    [{
                        text: keyboard_admin_cards[1][0] + ': ' + card_data[chat.id][2],
                        callback_data: keyboard_admin_cards[1][1]
                    },
                    {
                        text: keyboard_admin_cards[2][0] + ': ' + card_data[chat.id][0],
                        callback_data: keyboard_admin_cards[2][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_cards[0][1]){
        isChangingPrefs[chat.id] = 1
        bot.editMessageText('💳 Введите номер своей карты. Ее мы будем отправлять клиенту при оплате онлайн:', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[1][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_cards[1][1]){
        isChangingPrefs[chat.id] = 2
        bot.editMessageText('👤 Введите ФИО держателя карты: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[1][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_cards[2][1]){
        isChangingPrefs[chat.id] = 3
        bot.editMessageText('Если у Вас есть KASPI номер, можете указать и его. ВАЖНО! Если этого функционала у вас нет, ничего не вводите, или напишите "unknown" ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[1][1]
                    }]
                ]
            }
        })
    }

    //КОНТАКТЫ
    if (query.data === 'backtoalldata_cb'){
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: keyboards.admin_preferences_keyboard
            }
        })
    }
    if (query.data === keyboards.admin_preferences_buttons[2][1]){
        
        bot.editMessageText('Указанные ниже данные используют Ваши клиенты для связи с Вами', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_phone[0][0] + ': ' + help_phone[chat.id],
                        callback_data: keyboard_admin_phone[0][1]
                    }],
                    [{
                        text: keyboard_admin_phone[1][0] + ': ' + support_username[chat.id],
                        callback_data: keyboard_admin_phone[1][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_phone[0][1]){
        isChangingPhone[chat.id] = 1
        bot.editMessageText('📞 Напишите номер телефона службы поддержки:', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[2][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_phone[1][1]){
        isChangingPhone[chat.id] = 2
        bot.editMessageText('Отправьте ник телеграм-аккаунта, с которого будет отвечать Ваша служба поддержки', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[2][1]
                    }]
                ]
            }
        })
    }


    //РАСПИСАНИЕ
    if (query.data === keyboards.admin_preferences_buttons[3][1]){
        
        bot.editMessageText('У ваших пользователей могут быть ограничения по времени (напр. абонемент с 8:00-17:00). Настройте утреннее и вечернее время:', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_times[0][0] + ' ' +  morning_time[chat.id],
                        callback_data: keyboard_admin_times[0][1]
                    }],
                    [{
                        text: keyboard_admin_times[1][0] + ' ' + evening_time[chat.id],
                        callback_data: keyboard_admin_times[1][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_times[0][1]){
        isChangingTime[chat.id] = 1
        bot.editMessageText('🌥 Укажите дневное время Вашего клуба (напр. с 8.00 - 17.00). УКАЗЫВАЙТЕ ВРЕМЯ В ФОРМАТЕ: Ч:ММ-Ч:ММ. В противном случае возможны сбои в работе временных ограничений', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[3][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_times[1][1]){
        isChangingTime[chat.id] = 2
        bot.editMessageText('🌚 Укажите вечернее время Вашего клуба (напр. с 8.00 - 17.00). УКАЗЫВАЙТЕ ВРЕМЯ В ФОРМАТЕ: Ч:ММ-Ч:ММ. В противном случае возможны сбои в работе временных ограничений', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_cards[3][0],
                        callback_data: keyboards.admin_preferences_buttons[3][1]
                    }]
                ]
            }
        })
    }

    //ЛОКАЦИЯ
    if (query.data === keyboards.admin_preferences_buttons[0][1]){
        bot.editMessageText('Здесь вы можете изменить адрес вашего клуба.', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_location[0][0] + point_adress[chat.id],
                        callback_data: keyboard_admin_location[0][1]
                    }],
                    [{
                        text: keyboard_admin_location[1][0] + point_location[chat.id][0],
                        callback_data: keyboard_admin_location[1][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_location[0][1]){
        isChangingLocation[chat.id] = 1
        bot.editMessageText('Напишите <b>адрес</b> Вашего клуба:', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_location[2][0],
                        callback_data: keyboards.admin_preferences_buttons[0][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_location[1][1]){
        isChangingLocation[chat.id] = 2
        bot.editMessageText('Отправьте <b>Геопозицию</b> Вашего клуба. Нажмите на скрепку слева от клавиатуры и выберите пункт<b> "Геопозиция". </b>', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_location[2][0],
                        callback_data: keyboards.admin_preferences_buttons[0][1]
                    }]
                ]
            }
        })
    }

    //ЛОЯЛЬНОСТЬ
    if (query.data === keyboards.admin_preferences_buttons[5][1]){
        var cb_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/loyal_system')
        cb_data.get().then((snapshot) => {
            cashback[chat.id] = snapshot.val().cashback
            max_cashback[chat.id] = snapshot.val().max_cashback
            min_cashback[chat.id] = snapshot.val().min_cashback
            min_price[chat.id] = snapshot.val().min_price
        })
        bot.editMessageText('Здесь вы можете настроить <b>Систему лояльности</b>. За каждую посещеную тренировку клиенты получают <b>кэшбэк</b>, который могут потратить <b>в Вашем магазине</b>. Это стимулирует продажи товаров из магазина, а также <i>мотивирует клиентов приходить на тренировки.</i>', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_phone[2][0],
                        callback_data: 'backtoalldata_cb'
                    }],
                    [{
                        text: keyboard_admin_loyal[0][0] + cashback[chat.id] + ' тг.',
                        callback_data: keyboard_admin_loyal[0][1]
                    }],
                    [{
                        text: keyboard_admin_loyal[1][0] + min_price[chat.id] + ' тг.',
                        callback_data: keyboard_admin_loyal[1][1]
                    }],
                    [{
                        text: keyboard_admin_loyal[3][0] + (min_cashback[chat.id]*100) + '%',
                        callback_data: keyboard_admin_loyal[3][1]
                    },
                    {
                        text: keyboard_admin_loyal[4][0] + (max_cashback[chat.id]*100) + '%',
                        callback_data: keyboard_admin_loyal[4][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_loyal[0][1]){
        isChangingCashback[chat.id] = 1
        bot.editMessageText('Введите сумму, которую будут получать Ваши клиенты за тренировку. Если у клиента безлимитный абонемент, он получит в 3 раза меньше этой суммы. ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_loyal[2][0],
                        callback_data: keyboards.admin_preferences_buttons[5][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_loyal[1][1]){
        isChangingCashback[chat.id] = 2
        bot.editMessageText('Введите минимальную сумму товара, который можно оплатить балансов', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_loyal[2][0],
                        callback_data: keyboards.admin_preferences_buttons[5][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_loyal[3][1]){
        isChangingCashback[chat.id] = 3
        bot.editMessageText('Введите минимальный % от цены товара, при котором клиент может оплатить товар бонусами. Например, если товар стоит 1000тг, а мин. процент - 30%, то клиент может использовать баллы для оплаты, только если у него их больше 300 тг. ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_loyal[2][0],
                        callback_data: keyboards.admin_preferences_buttons[5][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_loyal[4][1]){
        isChangingCashback[chat.id] = 4
        bot.editMessageText('Введите максимальный % от цены товара, при котором клиент может оплатить товар бонусами. Например, если товар стоит 1000тг, а мин. процент - 30%, то клиент может оплатить бонусами максимум 300тг., а остальную сумму - реальными деньгами', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_loyal[2][0],
                        callback_data: keyboards.admin_preferences_buttons[5][1]
                    }]
                ]
            }
        })
    }

    //ВОРОНКА
    if (query.data === keyboards.admin_preferences_buttons[4][1]){
        var cb_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/discounts')
        cb_data.get().then((snapshot) => {
            discountvalues[chat.id] = []
            discountvalues[chat.id][0] = snapshot.val().goodvalue
            discountvalues[chat.id][1] = snapshot.val().middlevalue
            discountvalues[chat.id][2] = snapshot.val().badvalue
            discountvalues[chat.id][3] = snapshot.val().maxvalue

            bot.editMessageText('Здесь вы можете настроить <b>систему скидок для новых клиентов.</b> Если к Вам приходит новый клиент и покупает одну из пробных программ (на 1 день), через несколько часов после тренировки бот спросит его, все ли ему понравилось. В зависимости от ответа, бот может <b>предложить скидку на покупку полноценного абонемента.</b> Это увеличит конверсию из пробных тренировок в долгосрочные абонементы.', {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: messages_todelete[chat.id][1],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: keyboard_admin_phone[2][0],
                            callback_data: 'backtoalldata_cb'
                        }],
                        [{
                            text: keyboard_admin_voron[0][0] + discountvalues[chat.id][0] + '%',
                            callback_data: keyboard_admin_voron[0][1]
                        },
                        {
                            text: keyboard_admin_voron[1][0] + discountvalues[chat.id][1] + '%',
                            callback_data: keyboard_admin_voron[1][1]
                        },
                        {
                            text: keyboard_admin_voron[3][0] + discountvalues[chat.id][2] + '%',
                            callback_data: keyboard_admin_voron[3][1]
                        }],
                        [{
                            text: keyboard_admin_voron[4][0] + discountvalues[chat.id][3] + ' тг.',
                            callback_data: keyboard_admin_voron[4][1]
                        }]
                    ]
                }
            })
        })
        
    }

    if (query.data === keyboard_admin_voron[0][1]){
        isChangingVoron[chat.id] = 1
        bot.editMessageText('Если будущему клиенту <b>понравилась</b> тренировка, мы предложим ему купить абонемент. Если он откажется или не отреагирует, то спустя некоторое время мы предложим ему скидку. Введите % этой скидки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_voron[2][0],
                        callback_data: keyboards.admin_preferences_buttons[4][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_voron[1][1]){
        isChangingVoron[chat.id] = 2
        bot.editMessageText('Если будущий клиент отметил, что тренировка прошло <b>нормально</b>, мы предложим ему купить абонемент. Если он откажется или не отреагирует, то спустя некоторое время мы предложим ему скидку. Введите % этой скидки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_voron[2][0],
                        callback_data: keyboards.admin_preferences_buttons[4][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_voron[3][1]){
        isChangingVoron[chat.id] = 3
        bot.editMessageText('Если будущему клиенту <b>не понравилась тренировка,</b> бот принесет свои извинения и предложит получить полноценный абонемент <b>с хорошей скидкой</b>. Введите сумму это скидки: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_voron[2][0],
                        callback_data: keyboards.admin_preferences_buttons[4][1]
                    }]
                ]
            }
        })
    }

    if (query.data === keyboard_admin_voron[4][1]){
        isChangingVoron[chat.id] = 4
        bot.editMessageText('В зависимости от того, на какую программу клиент купил пробный абонемент, ему может быть предложены скидки не только на месячный, но и на 3-х, 6-и и 12-и месячный абонементы. Введите максимальную сумму скидки (тг), которую может предложить бот: ', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: keyboard_admin_voron[2][0],
                        callback_data: keyboards.admin_preferences_buttons[4][1]
                    }]
                ]
            }
        })
    }
    /////////////////////////////////////////////////////////////////////
    //АНАЛИТИКА
    if (query.data ===  keyboards.admin_menu_buttons[2][1]){
        bot.editMessageText(messages_texts[chat.id][0], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][0]
        })
        .then(() => {
            var other_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/analytics/')
            other_data.get().then((snapshot) => {
                //guserdata[chat.id] = []   /* <---- ЭТО УБРАТЬ */
                /* guserdata[chat.id][12] = snapshot.val().sh_online  <------ ЭТО ОСТАВИТЬ*/
                //guserdata[chat.id] = ['Иосиф Кутателадзе', '+77075112224', 'Каратэ', 'АКТИВЕН', 'Дата начала', 'Дата конца','10000 тг.', 'Без ограничений', 'Бес ограничений', 'Нет', 'НЕт', 10, snapshot.val().sh_online]
                //GoogleAddUser(chat.id, guserdata[chat.id])
                bot.sendMessage(chat.id, 'В этом разделе отображены ссылки на все <b>документы аналитики, базы данных с клиентами и тд.</b> Каждые 30 дней вы можете скачать отчет с подробным анализом полученных показателей', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: '◀️ Назад',
                                callback_data: keyboards.admin_preferences_buttons[6][1]
                            }],
                            [{
                                text: adminreports[0],
                                callback_data: adminreports[1]
                            }],
                            [{
                                text: '👤 БД с клиентами',
                                url: 'https://docs.google.com/spreadsheets/d/' + snapshot.val().sh_online
                            }]
                        ]
                    }
                })
                .then(res => {
                    messages_todelete[chat.id][1] = res.message_id
                    messages_texts[chat.id][1] = res.text
                })
            })
        })
    }

    if (query.data === backfromadmreports[1]){
        var other_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/analytics/')
        other_data.get().then((snapshot) => {
            bot.editMessageText(messages_texts[chat.id][0], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: messages_todelete[chat.id][1],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '◀️ Назад',
                            callback_data: keyboards.admin_preferences_buttons[6][1]
                        }],
                        [{
                            text: adminreports[0],
                            callback_data: adminreports[1]
                        }],
                        [{
                            text: '👤 БД с клиентами',
                            url: 'https://docs.google.com/spreadsheets/d/' + snapshot.val().sh_online
                        }]
                    ]
                }
            })
        })
        
    }

    if (query.data === adminreports[1]){
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1]
        })

        var other_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/analytics/')
            other_data.get().then((snapshot) => {
                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let time_now = new Date(utcTime + (3600000 * timeOfffset))
                let end_time = new Date(snapshot.val().last_report_date)
                end_time = end_time.setMonth(end_time.getMonth() + 1, end_time.getDate())
                let kb = []
                kb[0] = [{
                    text: backfromadmreports[0],
                    callback_data: backfromadmreports[1]
                }]
                let msg_txt = ''
                let allreports = Object.keys(snapshot.val().reports)
                
                if (time_now >= end_time){
                    kb[1] = [{
                        text: adminnewreport[0],
                        callback_data: adminnewreport[1]
                    }]

                    msg_txt = `Вам доступен отчет за месяц 🥳
ABONEMENTS.ME рады помогать Ваше бизнесу расти! 

За все время пользования сервисом:
🤝 Продаж совершено: <b>` + snapshot.val().alltime_data.net_sold + `</b>
💰 Выручка: <b>` + snapshot.val().alltime_data.net_income + ` тенге. </b>
`
                    if (snapshot.val().alltime_data.net_conversions > 5) {
                        msg_txt += `🆕 Конверсий в постоянных клиентов: <b>` + snapshot.val().alltime_data.net_conversions + ` человек(-а) </b>`
                    }

                    for (let i = 0; i < allreports.length; i++){
                        var moredata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/analytics/reports/' + allreports[i])
                        moredata.get().then((result) => {
                            if (result.exists()){
                                kb[i+2] = [{
                                    text: result.val().name,
                                    url: result.val().link
                                }]
                                if (i === allreports.length - 1){ 
                                    bot.editMessageText(msg_txt, {
                                        chat_id: chat.id,
                                        message_id: messages_todelete[chat.id][1],
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            inline_keyboard: kb
                                        }
                                    })

                                }
                            }
                            else {
                                bot.editMessageText(msg_txt, {
                                    chat_id: chat.id,
                                    message_id: messages_todelete[chat.id][1],
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: kb
                                    }
                                })
                            }
                        })
                    }
                }

                if (time_now < end_time){
                    msg_txt = 'На этой странице вы можете просмотреть <b>все доступные отчеты</b>. Нажмите на одну из кнопок ниже, чтобы перейти к документу: '
                
                    for (let i = 0; i < allreports.length; i++){
                        var moredata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/analytics/reports/' + allreports[i])
                        moredata.get().then((result) => {
                            if (result.exists()){
                                kb[i+1] = [{
                                    text: result.val().name,
                                    url: result.val().link
                                }]
                                if (i === allreports.length - 1){ 
                                    bot.editMessageText(msg_txt, {
                                        chat_id: chat.id,
                                        message_id: messages_todelete[chat.id][1],
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            inline_keyboard: kb
                                        }
                                    })

                                }
                            }
                            else {
                                bot.editMessageText(msg_txt, {
                                    chat_id: chat.id,
                                    message_id: messages_todelete[chat.id][1],
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: kb
                                    }
                                })
                                 
                            }
                        })
                    }

                }
                
                
            })
    }

    if (query.data === adminnewreport[1]){
        GoogleCreateReport(chat.id, chat.first_name)
        bot.sendChatAction(chat.id, 'upload_document')
        bot.editMessageText('<b>⏳ Подготавливаем отчет.</b> Это может занять несколько минут. Ничего не трогайте...', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1]
        })

    }
}

    if (chat.type === 'group' || chat.type === 'supergroup'){
        bot.getChat(chat.id).then((result0) => {
            if (result0.description !== null || result0.description !== undefined){
                let del_userdata = []
                console.log(result0)
                del_userdata[chat.id] = result0.description.split('/')
                console.log('Chats| this: ' + chat.id + ', ' + del_userdata[chat.id][2])
                if (del_userdata[chat.id][2] === (chat.id).toString()){
                    let userdata = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/clients/')
                    userdata.get().then((result) => {
                        //IdentifyUser(query.message.chat.id, false)
                        let clients_array = Object.keys(result.val())
                        console.log('Вы нажимаете на кнопку callback для операторов: ' + query.data + ', array = ' + clients_array.length)
                        for(let i = clients_array.length - 1; i >= 0; i--){
                            console.log(i + ' Processing... ' + query.data + ', ' + (accept_order_callback + clients_array[i]))
                            if (query.data === accept_order_callback + clients_array[i].toString()){
                                accepted_order_name = clients_array[i]
                                console.log('Вы приняли заказ: ' + accepted_order_name)
                                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                                let orderinfo = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/clients/' + clients_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {   
                                    guserdata[query.from.id] = []
                                    console.log(query)
                                    console.log('acceptor name2 : ' + query.from.first_name + ', ' + query.from.id)
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let accept_date = new Date(utcTime + (3600000 * timeOfffset))
                                    let end_date
                                    /* if (snapshot.val().abonement.end_date !== '0'){
                                        end_date = new Date(snapshot.val().abonement.end_date)
                                        
                                    }
                                    if (snapshot.val().abonement.end_date === '0'){
                                        end_date = new Date (accept_date.getFullYear(), accept_date.getMonth(), accept_date.getDate(), accept_date.getHours(), accept_date.getMinutes())
                                        end_date.setMonth(accept_date.getMonth() + snapshot.val().abonement.period, accept_date.getDate())
                                    } */

                                    if (accept_date.getTime() >= snapshot.val().abonement.end_date){
                                        end_date = new Date (accept_date.getFullYear(), accept_date.getMonth(), accept_date.getDate(), accept_date.getHours(), accept_date.getMinutes())
                                        end_date.setMonth(accept_date.getMonth() + snapshot.val().abonement.period, accept_date.getDate())
                                    }

                                    if (accept_date.getTime() < snapshot.val().abonement.end_date){
                                        end_date = new Date (snapshot.val().abonement.end_date)
                                        end_date.setMonth(end_date.getMonth() + snapshot.val().abonement.period, end_date.getDate())
                                        console.log('новая дата окончания: ' + end_date)
                                    }
                                    /* if (snapshot.val().abonement.period < 12){
                                    }
                                    if (snapshot.val().abonement.period >= 12){
                                        end_date.setFullYear(accept_date.getFullYear() + 1,accept_date.getMonth(), accept_date.getDate())
                                    } */
                                    console.log('дата начала: ' + accept_date.getTime() + ', дата конца: ' + end_date.getTime() + ', ' + snapshot.val().abonement.period)
                                      
                                    /////ИЗМЕНЯЕМ ЧЕК///////////////

                                    let Astana_date_accept = new Date(accept_date.getTime())  
                                    let minutes2 = Astana_date_accept.getMinutes()
                                    if (minutes2 < 10) minutes2 = '0' + minutes2
                                    let hours2 = Astana_date_accept.getHours()
                                    if (hours2 < 10) hours2 = '0' + hours2
                                    let visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()
                                
                                    let Astana_date_end = new Date(end_date.getTime())  
                                    let minutes = Astana_date_end.getMinutes()
                                    if (minutes < 10) minutes = '0' + minutes
                                    let hours = Astana_date_end.getHours()
                                    if (hours < 10) hours = '0' + hours
                                    let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_end) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date_end.getDate() + '.' + (Astana_date_end.getMonth() + 1) + '.' + Astana_date_end.getFullYear()
                                
                                    abonements_bill_topic = abonement_bill_topic_names[1]
                                    abonemets_bill_client_info = `
                                
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().name + `
└ Номер: ` + snapshot.val().phone + `
                                
`
                                    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + snapshot.val().abonement.name + `
├ Срок действия: ` + snapshot.val().abonement.period + ` мес.
└ Стоимость: ` +snapshot.val().abonement.price + `  тенге.
                                
`
                                
                                if (snapshot.val().abonement.time === 'unlimited'){
abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
guserdata[query.from.id][7] = 'Без ограничений'
                                }
                                
                                if (snapshot.val().abonement.time !== 'unlimited'){
                                    if (snapshot.val().abonement.time === 'morning'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[query.from.id][0][0] + `:` + morning_time[query.from.id][0][1] + ` до ` + morning_time[query.from.id][1][0] + `:` + morning_time[query.from.id][1][1] 
guserdata[query.from.id][7] = `c ` + morning_time[query.from.id][0][0] + `:` + morning_time[query.from.id][0][1] + ` до ` + morning_time[query.from.id][1][0] + `:` + morning_time[query.from.id][1][1] 
}
                                
                                    if (snapshot.val().abonement.time === 'evening'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[query.from.id][0][0] + `:` + evening_time[query.from.id][0][1] + ` до ` + evening_time[query.from.id][1][0] + `:` + evening_time[query.from.id][1][1] 
guserdata[query.from.id][7] = `c `+ evening_time[query.from.id][0][0] + `:` + evening_time[query.from.id][0][1] + ` до ` + evening_time[query.from.id][1][0] + `:` + evening_time[query.from.id][1][1] 
}
                                }
                                
                                if (snapshot.val().abonement.visits === 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
guserdata[query.from.id][8] = 'Без ограничений'
                                }
                                
                                if (snapshot.val().abonement.visits !== 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: ` + snapshot.val().abonement.visits
guserdata[query.from.id][8] = snapshot.val().abonement.visits
                                }
                                
                                if (snapshot.val().abonement.freeze_amount === false){
                                    abonements_bill_order_info += `
└ Нет функции заморозки`
guserdata[query.from.id][9] = 'Нет'
                                }
                                
                                if (snapshot.val().abonement.freeze_amount !== false){
                                    abonements_bill_order_info += `
└ Кол-во заморозок: ` + snapshot.val().abonement.freeze_amount + ` дней.`
guserdata[query.from.id][9] = snapshot.val().abonement.freeze_amount + ` дней.`
                                }

                                    abonements_bill_order_info += `

<b>🕔 Детализация:</b>
├ Дата старта абонемента: ` + visible_date_accept + `
├ Дата конца абонемента: ` + visible_date_end + `
└ Имя сотрудника: ` + query.from.first_name + ', id: ' + query.from.id
                                
                                    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info

                                    let updates = {}

                                    if (snapshot.val().abonement.abonement_status === abonement_statuses_text[4]){
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/audience/stats/active'] = res.val().current_data.audience.stats.active + 1
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/audience/stats/inactive'] = res.val().current_data.audience.stats.inactive - 1
                                    }

                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/bill_text'] = abonements_bill
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/bill_msg'] = query.message.message_id,
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/start_date'] = accept_date.getTime()
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/end_date'] = end_date.getTime()
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/abonement_status'] = abonement_statuses_text[2]
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/activator_name'] =  query.from.first_name
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/activator_id'] =  query.from.id

                                    updates['Motherbase/clients/'+ clients_array[i] + '/fitness/start_date'] = accept_date.getTime()
                                    updates['Motherbase/clients/'+ clients_array[i] + '/fitness/end_date'] = end_date.getTime()
                                    updates['Motherbase/clients/'+ clients_array[i] + '/fitness/abonement_status'] = abonement_statuses_text[2]

                                    let sh_info = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/analytics/');
                                    sh_info.get().then((res) => 
                                    {
                                        
                                        if (snapshot.val().userrow !== undefined){
                                            guserdata[query.from.id][11] = snapshot.val().userrow
                                        }

                                        if (snapshot.val().userrow === undefined){
                                            guserdata[query.from.id][11] = res.val().nextuser_row
                                            updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/audience/stats/net_users'] = res.val().current_data.audience.stats.net_users + 1
                                            updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/audience/stats/active'] = res.val().current_data.audience.stats.active + 1
                                            updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/nextuser_row'] =  guserdata[query.from.id][11] + 13
                                        }
                                        
                                        if (res.val().sh_online !== undefined){
                                            console.log('sh: ' + res.val().sh_online)
                                            guserdata[query.from.id][12] = res.val().sh_online
                                        }

                                        programme_pas[clients_array[i]] = snapshot.val().programme_pas //"Fitness/ForceClub/Program/categories/silovye/programmes/bezlimit_den"
                                        // 4 - categ, 6 - program
                                        programme_pas[clients_array[i]] = programme_pas[clients_array[i]].split('/')
                                        console.log(res.val().current_data.income.abonements.abonements_income + snapshot.val().abonement.price)
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/alltime_data/net_income'] = (res.val().alltime_data.net_income + snapshot.val().abonement.price)
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/alltime_data/net_sold'] = (res.val().alltime_data.net_sold + 1)

                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/abonements_income'] = (res.val().current_data.income.abonements.abonements_income + snapshot.val().abonement.price)
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/abonements_sold'] = res.val().current_data.income.abonements.abonements_sold + 1
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/net_income'] = res.val().current_data.income.net_income + snapshot.val().abonement.price
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/net_sold'] = res.val().current_data.income.net_sold + 1

                                        //updates['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/abonements_income'] =  res.val().current_data.income.abonements.abonements_income +  snapshot.val().abonement_price
                                        
                                        let program_stat = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/' + programme_pas[clients_array[i]][6])
                                        program_stat.get().then((program_res) => {
                                            let new_update = {}
                                            if (program_res.exists()){ 
                                                new_update['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/' + programme_pas[clients_array[i]][6] + '/income'] = program_res.val().income + snapshot.val().abonement.price
                                                new_update['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/' + programme_pas[clients_array[i]][6] + '/sold'] = program_res.val().sold + 1
                                            }
                                            else { 
                                                new_update['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/' + programme_pas[clients_array[i]][6] + '/income'] = snapshot.val().abonement.price
                                                new_update['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/' + programme_pas[clients_array[i]][6] + '/sold'] = 1
                                                new_update['Fitness/'+del_userdata[chat.id][0]+'/analytics/current_data/income/abonements/' + programme_pas[clients_array[i]][6] + '/name'] = snapshot.val().abonement.name
                                            }
                                            fb.database().ref().update(new_update)
                                        })


                                        guserdata[query.from.id][0] = snapshot.val().name
                                        guserdata[query.from.id][1] = snapshot.val().phone
                                        guserdata[query.from.id][2] = snapshot.val().abonement.name
                                        guserdata[query.from.id][3] = abonement_statuses_text[2]
                                        guserdata[query.from.id][6] = snapshot.val().abonement.price + ' тг.'
                                        guserdata[query.from.id][4] = visible_date_accept
                                        guserdata[query.from.id][5] = visible_date_end
                                        guserdata[query.from.id][10] = 'Нет'
       
                                        updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/userrow'] =  guserdata[query.from.id][11]
                                        fb.database().ref().update(updates)

                                        GoogleAddUser(query.from.id, guserdata[query.from.id])
                                        
                                    })

                                    

                                    bot.editMessageText(abonements_bill, {
                                        parse_mode: 'HTML',
                                        chat_id: chat.id,
                                        message_id: message_id
                                    })
                                })
                                break
                            }
                            else if (query.data === refuse_order_callback + clients_array[i]){
                                console.log('Вы отклонили заказ: ' + clients_array[i])
                                let orderinfo = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/clients/' + clients_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let refuse_date = new Date(utcTime + (3600000 * timeOfffset))
                                    
                                    let Astana_date_accept = new Date(refuse_date)
                                    let minutes2 = Astana_date_accept.getMinutes()
                                    if (minutes2 < 10) minutes2 = '0' + minutes2
                                    let hours2 = Astana_date_accept.getHours()
                                    if (hours2 < 10) hours2 = '0' + hours2
                                    let visible_date_refuse = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()
                                
                                    abonements_bill_topic = abonement_bill_topic_names[2]
                                    abonemets_bill_client_info = `
                                
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().name + `
└ Номер: ` + snapshot.val().phone + `
                                
`
                                    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + snapshot.val().abonement.name + `
├ Срок действия: ` + snapshot.val().abonement.period + ` мес.
└ Стоимость: ` +snapshot.val().abonement.price + `  тенге.
                                
`
                                
                                if (snapshot.val().abonement.time === 'unlimited'){
abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
                                }
                                
                                if (snapshot.val().abonement.time !== 'unlimited'){
                                    if (snapshot.val().abonement.time === 'morning'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[chat.id][0][0] + `:` + morning_time[chat.id][0][1] + ` до ` + morning_time[chat.id][1][0] + `:` + morning_time[chat.id][1][1] 
                                    }
                                
                                    if (snapshot.val().abonement.time === 'evening'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[chat.id][0][0] + `:` + evening_time[chat.id][0][1] + ` до ` + evening_time[chat.id][1][0] + `:` + evening_time[chat.id][1][1] 
                                    }
                                }
                                
                                if (snapshot.val().abonement.visits === 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
                                }
                                
                                if (snapshot.val().abonement.visits !== 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: ` + snapshot.val().abonement.visits
                                }
                                
                                if (snapshot.val().abonement.freeze_amount === false){
                                    abonements_bill_order_info += `
└ Нет функции заморозки`
                                }
                                
                                if (snapshot.val().abonement.freeze_amount !== false){
                                    abonements_bill_order_info += `
└ Кол-во заморозок: ` + snapshot.val().abonement.freeze_amount + ` дней.`
                                }

                                    abonements_bill_order_info += `

<b>🕔 Детализация:</b>
├ Дата отказа в заявке: ` + visible_date_refuse + `
└ Имя сотрудника: ` + query.from.first_name + ', id: ' + query.from.id
                                
                                    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info

                                    let updates = {}
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/bill_text'] = abonements_bill
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/bill_msg'] = query.message.message_id,
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/abonement_status'] = abonement_statuses_text[3]
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/activator_name'] =  query.from.first_name
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i] + '/abonement/activator_id'] =  query.from.id

                                    updates['Motherbase/clients/'+ clients_array[i] + '/fitness/start_date'] = '0'
                                    updates['Motherbase/clients/'+ clients_array[i] + '/fitness/end_date'] = '0'
                                    updates['Motherbase/clients/'+ clients_array[i] + '/fitness/abonement_status'] = abonement_statuses_text[3]
                                    //updates['Basement/clients/CLIENTID/EGO_CHECK'] = order_update
                                    fb.database().ref().update(updates)

                                    bot.editMessageText(abonements_bill, {
                                        parse_mode: 'HTML',
                                        chat_id: chat.id,
                                        message_id: message_id
                                    })
                                })
                                break
                            }
                            else if (i === 0) {
                                console.log(i + 'HERE IT IS')
                                bot.editMessageText('💭 Заявка не найдена.', {
                                    chat_id: chat.id,
                                    message_id: message_id
                                })
                            }
                        }
                    })
                }
                if (query.data.includes('bytm_')){
                    bot.editMessageText(text, {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_id
                    })
                    .then(() => {
                        let info = query.data.split('_') 
                        let anal = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales')
                        anal.get().then((result) => {
                        //'bytm_' + userItem[chat.id] + '_' + result.val().name + '_' + result.val().price
                            let updates_general = {}
                            updates_general['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/net_income'] = result.val().net_income + parseInt(info[3])
                            updates_general['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/net_sold'] = result.val().net_sold + 1
                            updates_general['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/items/items_income'] = result.val().items.items_income + parseInt(info[3])
                            updates_general['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/items/items_sold'] = result.val().items.items_sold + 1
                            fb.database().ref().update(updates_general)
                        })
                        let item_detailed = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/items/' + info[1])
                        item_detailed.get().then((snap) => {
                            if (snap.exists()){
                                let updates_detailed = {}
                                updates_detailed['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/items/' + info[1] + '/income'] = snap.val().income + parseInt(info[3])
                                updates_detailed['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/items/' + info[1] + '/sold'] = (snap.val().sold + 1)
                                fb.database().ref().update(updates_detailed)
                            }
                            else {
                                let updates_detailed = {}
                                let newitem = {
                                    income: snap.val().income + parseInt(info[3]),
                                    name: info[2],
                                    sold: (snap.val().sold + 1)
                                }
                                updates_detailed['Fitness/'+del_userdata[chat.id][0]+'analytics/current_data/sales/items/' + info[1]] = newitem
                                fb.database().ref().update(updates_detailed)
                            }                            
                        })
                    })
                }
            }
            else {
                bot.sendMessage(chat.id, 'Извините, этот бот пока не работает в группах и каналах 🥺')
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
bot.onText(/\/our_programs/, msg => {
    const { chat, message_id, text } = msg
    bot.editMessageText(text, {
        chat_id: chat.id,
        message_id: message_id
    }).catch(err => {console.log('here: ' + err)})
    keyboards.ProgramCategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, backtomain_text, choosecategory_text, club_name_fb[chat.id])
})
bot.onText(/\/shop/, msg => {
    const { chat, message_id, text } = msg
    bot.editMessageText(text, {
        chat_id: chat.id,
        message_id: message_id
    }).catch(err => {console.log('here: ' + err)})
    let ppl_ingroup = fb.database().ref('Fitness/'+club_name_fb[chat.id] + '/shop')
    ppl_ingroup.get().then((snapshot) => {
        if (snapshot.exists()){
            keyboards.ShopCategoriesKeyboard(shop_keyboard[chat.id], userShopCategories[chat.id], fb, bot, chat.id, backtomain_text, chooseshopcategory_text, club_name_fb[chat.id])
        }
        else {
            bot.sendMessage(chat.id, 'Мы пока что не добавили товары в этот раздел, но скоро исправимся 😇', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }]
                    ]
                }
            })
        }
    })
})
bot.onText(/\/our_coaches/, msg => {
    const { chat, message_id, text } = msg
    bot.editMessageText(text, {
        chat_id: chat.id,
        message_id: message_id
    }).catch(err => {console.log('here: ' + err)})
    keyboards.TrenersKeyboard(trener_keyboard[chat.id], userTreners[chat.id], fb, bot, chat.id, backtomain_text, choosetrener_text, club_name_fb[chat.id])
})
bot.onText(/\/start/, msg => {
    console.log(msg)
    const chatId = msg.chat.id
    current_chat = chatId
    //userstatus[chatId] = 'registered'
    if (msg.chat.type === 'private'){
        if (msg.text === '/start'){
            if (club_name_fb[chatId] !== undefined && club_name_fb[chatId] !== ''){
                //чел уже пользовался ботом клуба, идентифицируем и говорим привет
                
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chatId] = 2
                    bot.sendMessage(chatId, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                    .then(() => {
                        IdentifyUser(chatId, true)
                    })
                })
            }
    
            else {
                //посылаем клавиатуру с выбором качалок
                IdentifyUser(chatId, false)
                gym_keyboard[chatId] = []
                userGyms[chatId] = []
                keyboards.GymsKeyboard(gym_keyboard[chatId], userGyms[chatId], fb, bot, chatId, mother_link, choosegym_text)
            }
        }
        else {
            let userdata = fb.database().ref('Fitness/')
            userdata.get().then((result) => 
            {
                let clubs = Object.keys(result.val())
                for (let i = 0; i < clubs.length; i++){
                    console.log(clubs[i])
                    if (msg.text === '/start ' + clubs[i] + '_start'){
                        let temp = (msg.text).split(' ')
                        temp[1] = temp[1].split('_')
                        //
                        console.log(club_name_fb[chatId])
                        if (userstatus[chatId] === 'registered' && club_name_fb[chatId] === temp[1][0]){
                            console.log('Пользователь зареган и его клуб совпадает с клубом из ссылки. Можно начать тренировку')
                            StartTraining(chatId, msg.message_id)
    
                            for (let i=0; i<100; i++){
                                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                                    //console.log(err)
                                })
                            }
                            bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                            .then(() => {
                                anotherpoint_multiple[chatId] = 2
                                bot.sendMessage(chatId, hellomessage_text, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: keyboards.main_menu_keyboard
                                    }
                                })
                            })
                        }
                        else {
                            club_name_fb[chatId] = temp[1][0]
                            console.log(club_name_fb[chatId])
                            
                            for (let i=0; i<100; i++){
                                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                                    //console.log(err)
                                })
                            }
                            bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                            .then(() => {
                                anotherpoint_multiple[chatId] = 2
                                bot.sendMessage(chatId, hellomessage_text, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: keyboards.main_menu_keyboard
                                    }
                                })
                                .then(() => {
                                    IdentifyUser(chatId, true)
                                })
                            })
    
                        }
                    }
                    if ((msg.text).includes('/start bp-' + clubs[i]) === true){
                        if (userstatus[chatId] !== 'registered'){
                            let temp_link = (msg.text).split(' ')
                            temp_link = temp_link[1].split('-')
                            club_name_fb[chatId] = temp_link[1]
                            IdentifyUser(chatId, false)
                            console.log('512 ' + temp_link)
                            CreateAbonement(msg.chat, temp_link)
                        }

                        else {
                            bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                            .then(() => {
                                anotherpoint_multiple[chatId] = 2
                                bot.sendMessage(chatId, 'У вас уже есть абонемент в этом зале 🤩', {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: keyboards.main_menu_keyboard
                                    }
                                })
                                .then(() => {
                                    IdentifyUser(chatId, false)
                                })
                            }) 
                        }
                        
                    }
                    if (msg.text === '/start clubadmin_' + clubs[i]) {
                        let cbadmin_data = fb.database().ref('Fitness/' + clubs[i] + '/chats/admin_chat')
                        cbadmin_data.get().then((result) => {
                            if (result.val() === chatId){
                                isMailingMessage[chatId] = 0
                                isChangingPrefs[chatId] = 0
                                isChangingPhone[chatId] = 0
                                isChangingTime[chatId] = 0
                                isChangingLocation[chatId] = 0
                                isChangingCashback[chatId] = 0
                                isChangingVoron[chatId] = 0
                                mailing_text[chatId] = ''
                                mailing_mode[chatId] = ''
                                club_name_fb[chatId] = clubs[i]
                                isAdmin[chatId] = true
                                messages_texts[chatId] = []
                                messages_todelete[chatId] = []
                                IdentifyUser(chatId,false)
                                bot.sendMessage(chatId, 'Привет! Вы вошли как <b>Администратор</b> клуба. Вы можете изменять настройки бота, отправлять рассылки и запрашивать отчеты.', {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: keyboards.admin_menu_keyboard
                                    }
                                })
                                .then(res => {
                                    messages_texts[chatId][0] = res.text
                                    messages_todelete[chatId][0] = res.message_id
                                })
                            }
                        })
                    }
                }
            })
        }
    }

    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup'){
        bot.getChat(chatId).then(result => {
            if (result.description !== undefined && result.description !== null){
                console.log('group: ' + result.description)
                let del_userdata = []
                del_userdata[chatId] = result.description.split('/')
                if (del_userdata[chatId].length === 3 && del_userdata[chatId][2] === (chatId).toString())(
                    bot.sendMessage(chatId, 'Привет! Я буду скидывать сюда заявки на абонементы. Вы можете одобрить или отклонить заявку на абонемент. Сверьте данные в сообщении с оплатой, поступившей на Ваш счет. Если все верно, нажмите ✅ Создать абонемент')
                )
                else {
                    bot.sendMessage(chatId, 'Извините, этот бот не работает в группах, напишите ему в личные сообщения', {
                        reply_markup: {
                            inline_keyboard:[
                                [{
                                    text: 'ctOS 🤖',
                                    url: mother_link
                                }]
                            ]
                        }
                    })
                }
            }
            else {
                bot.sendMessage(chatId, 'Извините, этот бот не работает в группах, напишите ему в личные сообщения', {
                    reply_markup: {
                        inline_keyboard:[
                            [{
                                text: 'ctOS 🤖',
                                url: mother_link
                            }]
                        ]
                    }
                })
            }
        })
    }
})
bot.onText(/\/start_training/, msg => {
    const { chat, message_id, text } = msg
    IdentifyUser(chat.id, true)
    bot.deleteMessage(chat.id, message_id)
    if (userstatus[chat.id] !== 'registered'){
        bot.editMessageText('У вас еще нет абонемента. Самое время его выбрать!', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id - 1,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtomain_text,
                        callback_data: backtomain_text
                    }],
                    [{
                        text: keyboards.main_menu_buttons[1][0],
                        callback_data: keyboards.main_menu_buttons[1][1]
                    }]
                ]
            }
        })
    }
})
bot.onText(/\/im_admin/, msg => {
    const { chat, message_id, text } = msg
    for (let i=0; i<100; i++){
        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
            //console.log(err)
        })
    }
    let cbadmin_data = fb.database().ref('Fitness/' + club_name_fb[chat.id] + '/chats/admin_chat')
    cbadmin_data.get().then((result) => {
        if (result.val() === chat.id){
            isMailingMessage[chat.id] = 0
            isChangingPrefs[chat.id] = 0
            isChangingPhone[chat.id] = 0
            isChangingTime[chat.id] = 0
            isChangingLocation[chat.id] = 0
            isChangingCashback[chat.id] = 0
            isChangingVoron[chat.id] = 0
            mailing_text[chat.id] = ''
            mailing_mode[chat.id] = ''
            isAdmin[chat.id] = true
            messages_texts[chat.id] = []
            messages_todelete[chat.id] = []
            IdentifyUser(chat.id,false)
            bot.sendMessage(chat.id, 'Привет! Вы вошли как <b>Администратор</b> клуба. Вы можете изменять настройки бота, отправлять рассылки и запрашивать отчеты.', {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: keyboards.admin_menu_keyboard
                }
            })
            .then(res => {
                messages_texts[chat.id][0] = res.text
                messages_todelete[chat.id][0] = res.message_id
            })
        }
        else {
            bot.sendMessage(chat.id,  text_notadmin[Math.floor(Math.random() * text_notadmin.length)])
        }
    })
})

function IdentifyUser(current_chat, isTraing){

    console.log(club_name_fb[current_chat])

    deelay[current_chat] = ms => {
        return new Promise(r => setTimeout(() => r(), ms))
    }

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
    favourite_program[current_chat] = 'unknown'
    abonements_bought[current_chat] = 0
        userstatus[current_chat] = 'unknown'
    order_name[current_chat] = ''
    order_date[current_chat] = ''
    abonement_status[current_chat] = 'unknown'
    skidka[current_chat] = 0
    //user_lastbill[current_chat] = []
    user_mailingdata[current_chat] = []

    finalprice[current_chat] = 0
    finalbasket[current_chat] = ''
    temp_backet_food[current_chat] = 0
    temp_progtypes_text[current_chat] = ''
    temp_program_types[current_chat] = []
    myprogram_type[current_chat] = []
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
    userProgram[current_chat] = ''
    userProgrammesList[current_chat] = []
    programmes_keyboard[current_chat] = []
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

    trener_keyboard[current_chat] = []
    userTreners[current_chat] = []
    userTrener[current_chat] = ''

    isMakingChanges[current_chat] = 0
    isMakingChanges_2[current_chat] = 0

    userlocation[current_chat] = [0.1,0.1]
    nearest_place[current_chat] = 0
    min_distance[current_chat] = 9999999

    buttons_message[current_chat] = 0
    messages_todelete[current_chat] = []
    messages_texts[current_chat] = []
    
    answered_feedback[current_chat] = 0
    isAnswered_feedback[current_chat] = 0

    user_payingmethod[current_chat] = ''
    user_timescame[current_chat] = 0

    operators_chat[current_chat] = 0
    types_keyboard[current_chat] = []

    waitlist[current_chat] = ''
    //club_name_fb[current_chat] = ''

    userGyms[current_chat] = []
    gym_keyboard[current_chat] = []

    card_data[current_chat] = []
    point_location[current_chat] = []

    morning_time[current_chat] = []
    evening_time[current_chat] = []

    shop_keyboard[current_chat] = []
    userShopCategories[current_chat] = []
    userShopCategory[current_chat] = ''

    shopitems_keyboard[current_chat] = []
    userItemsList[current_chat] = []
    userItem[current_chat] = ''
    userItemPrice[current_chat] = 0

    programme_pas[current_chat] = ''

    user_freezeamount[current_chat] = 0

/*     suggestgoodskidka_text[current_chat][0] = 'Я подумаю...'
    suggestgoodskidka_text[current_chat][1] = 'sgstgdskdk_cb'
    suggestmiddleskidka_text[current_chat][0] = 'Я подумаю...'
    suggestmiddleskidka_text[current_chat][1] = 'sgstmdskdk_cb'
    suggestbadskidka_text[current_chat][0] = 'Я подумаю...'
    suggestbadskidka_text[current_chat][1] = 'gstbdskdk_cb' */

    if (club_name_fb[current_chat] !== undefined){
        var other_data = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/other_info')
        other_data.get().then((snapshot) => 
        {
            help_phone[current_chat] = snapshot.val().contact_phone
            point_location[current_chat][0] = snapshot.val().latitude
            point_location[current_chat][1] = snapshot.val().longitude
            point_adress[current_chat] = snapshot.val().adress_text
    
            morning_time[current_chat] = snapshot.val().morning_time
            morning_time[current_chat] = snapshot.val().morning_time.split('-')
            morning_time[current_chat][0] = morning_time[current_chat][0].split(':')
            morning_time[current_chat][1] = morning_time[current_chat][1].split(':')
    
            evening_time[current_chat] = snapshot.val().evening_time
            evening_time[current_chat] = snapshot.val().evening_time.split('-')
            evening_time[current_chat][0] = evening_time[current_chat][0].split(':')
            evening_time[current_chat][1] = evening_time[current_chat][1].split(':')
    
            support_username[current_chat] = snapshot.val().support_username
    
            card_data[current_chat][0] = snapshot.val().kaspi_phone
            card_data[current_chat][1] = snapshot.val().card
            card_data[current_chat][2] = snapshot.val().fio
    
        })
    
        var loyalsys_data = fb.database().ref('Fitness/'+ club_name_fb[current_chat] + '/loyal_system/')
        loyalsys_data.get().then((snapshot) => 
            {
                cashback[current_chat] = snapshot.val().cashback
                max_cashback[current_chat] = snapshot.val().max_cashback
                min_cashback[current_chat] = snapshot.val().min_cashback
                min_price[current_chat] = snapshot.val().min_price
            }
        )
        
        var chats_data = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/chats')
            chats_data.get().then((snapshot) => 
            {
                admin_id[current_chat] = snapshot.val().admin_chat
                operators_chat[current_chat] = snapshot.val().operators_chat
                console.log('!!! ' + admin_id[current_chat] + ' ' + operators_chat[current_chat])
            }
        )
    
        //теперь проверить зареган ли юзер. Если д - предлагаем начать тренировку
        let identifyes = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/clients/' + current_chat);
        identifyes.get().then((snapshot) => {
            if (snapshot.exists()){
                userstatus[current_chat] = 'registered'
                user_coins[current_chat] = snapshot.val().coins
                user_email[current_chat] = snapshot.val().email
                favourite_program[current_chat] = snapshot.val().favourite_program
                user_name[current_chat] = snapshot.val().name
                abonements_bought[current_chat] = snapshot.val().abonements_bought
                user_timescame[current_chat] = snapshot.val().times_came
                user_phone[current_chat] = snapshot.val().phone
    
                myprogram_type[current_chat][6] = snapshot.val().abonement.name
                myprogram_type[current_chat][2] = snapshot.val().abonement.time
                myprogram_type[current_chat][4] = snapshot.val().abonement.visits
                myprogram_type[current_chat][5] = snapshot.val().abonement.freeze_amount
                myprogram_type[current_chat][0] = snapshot.val().abonement.period
                myprogram_type[current_chat][1] = snapshot.val().abonement.price
                user_payingmethod[current_chat] = snapshot.val().paying_method
    
                if (isTraing === true){
                    const temp_tex = 'Хотите начать тренировку? Нажимая на кнопку Вы <b>подтверждаете свое присутсвие на тренировке.</b>'
                    bot.sendMessage(current_chat, temp_tex, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: accepttraining_text[0],
                                    callback_data: accepttraining_text[1]
                                },{
                                    text: refusetraining_text[0],
                                    callback_data: refusetraining_text[1]
                                }]
                            ],
                        }
                    })
                }
                
            }
            else {
                userstatus[current_chat] = 'unregistered'
            }
        }).catch(err => {console.log('1 ' + err)})
    }


}

function CreateAbonement(chat, temp_link){

    let updates = {};
    user_name[chat.id] = chat.first_name
    user_coins[chat.id] = 0
    user_email[chat.id] = 'unknown'
    user_phone[chat.id] = 'unknown'
    abonements_bought[chat.id] = 0
    favourite_program[chat.id] = temp_link[3]
    user_timescame[chat.id] = 0
    user_payingmethod[chat.id] = user_payingmethods[1][0]
    userProgram[chat.id] = temp_link[3]
    userCategory[chat.id] = temp_link[2]
    discountvalues[chat.id] = []
    programdiscount[chat.id] = 0

    suggestgoodskidka_text[chat.id] = ['Я подумаю...', 'sgstgdskdk_cb', '👋 Привет еще раз. Слушай, мы тут подумали и решили подарить тебе <b>скидку на абонемент по твоей программе.</b> Не упусти свой шанс! </b>']
    suggestmiddleskidka_text[chat.id] = ['Я подумаю...', 'sgstmdskdk_cb']
    suggestbadskidka_text[chat.id] = ['Я подумаю...', 'sgstbdskdk_cb']

    if (temp_link[4] !== 'onetime'){
        console.log('full time')
        programme_pas[chat.id] = 'Fitness/' + temp_link[1] + '/Program/categories/' + temp_link[2] + '/programmes/' + temp_link[3]

        let userdata = fb.database().ref('Fitness/' + temp_link[1] + '/Program/categories/' + temp_link[2] + '/programmes/' + temp_link[3]/*  + '/types/' + temp_link[4] */)
        userdata.get().then((result) => 
        {
            let username = []
            username[chat.id] = "undefined"
            if (chat.username != undefined) username[chat.id] = chat.username.toString()
            
            let userdata2 = fb.database().ref('Fitness/' + temp_link[1] + '/Program/categories/' + temp_link[2] + '/programmes/' + temp_link[3] + '/types/' + temp_link[4])
            userdata2.get().then((result2) => {
    
            abonements_bill_topic = abonement_bill_topic_names[0]
            abonemets_bill_client_info = `
    
<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
        abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + result.val().name + `
├ Срок действия: ` + result2.val().period + ` мес.
└ Стоимость: ` + result2.val().price + `  тенге.

`

    if (result2.val().time === 'unlimited'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
    }
    
    if (result2.val().time !== 'unlimited'){
        if (result2.val().time === 'morning'){
            abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[chat.id][0][0] + `:` + morning_time[chat.id][0][1] + ` до ` + morning_time[chat.id][1][0] + `:` + morning_time[chat.id][1][1] 
        }
    
        if (result2.val().time === 'evening'){
            abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[chat.id][0][0] + `:` + evening_time[chat.id][0][1] + ` до ` + evening_time[chat.id][1][0] + `:` + evening_time[chat.id][1][1] 
        }
    }
    
    if (result2.val().visits === 'unlimited'){
        abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
    }
    
    if (result2.val().visits !== 'unlimited'){
        abonements_bill_order_info += `
├ Кол-во посещений: ` + result2.val().visits
    }
    
    if (result2.val().is_freeze === false){
        abonements_bill_order_info += `
└ Нет функции заморозки`
    }
    
    if (result2.val().is_freeze !== false){
        abonements_bill_order_info += `
└ Кол-во заморозок: ` + result2.val().is_freeze + ` дней.`
    }
    
        console.log('order_date! ' + order_date[chat.id])
        abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info
        //console.log('last message id: ' + query.message.message_id)
    
                let newuser = {
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_program: favourite_program[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    abonements_bought: 0,
                    times_came: 0,
                    bill_text: abonements_bill,
                    programme_pas: programme_pas[chat.id],
                    abonement: {
                        name: result.val().name,
                        time: result2.val().time,
                        visits: result2.val().visits,
                        freeze_amount: result2.val().is_freeze,
                        period: result2.val().period,
                        price: result2.val().price,
                        freeze_start: '0',
                        start_date: '0',
                        end_date: '0',
                        abonement_status: abonement_statuses_text[0],
                        activator_name: 'unknown',
                        activator_id: 'unknown',
                        paying_method: user_payingmethod[chat.id]
                    }
                }
          
                order_name[chat.id] = 'Fitness/'+temp_link[1]+'/clients/' + chat.id
                console.log('ORDER NAME: ' + order_name[chat.id])
            
                userstatus[chat.id] = 'registered'
                club_name_fb[chat.id] = temp_link[1]
                updates[order_name[chat.id]] = newuser
            
                fb.database().ref().update(updates)
                StartCheckingOrder(chat.id)
    
                /* deelay[chat.id](10000/* 2*3600000 ).then(() => {
                    bot.sendMessage(chat.id, howdoyoulikeourtraining_text)
                    .then(() => {
                        bot.sendPoll(chat.id, feedback_options, {
                            is_anonymous: false
                        })
                    })
                }) */
    
                let cr_chat = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/chats/');
                cr_chat.get().then((snapshot) => {
                    operators_chat[chat.id] = snapshot.val().operators_chat
                    console.log('IT WORKS: ' + operators_chat[chat.id])
            
                    bot.sendMessage(operators_chat[chat.id], abonements_bill, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard:[
                                [{
                                    text: '✅ Создать абонемент',
                                    callback_data: accept_order_callback + chat.id
                                }],
                                [{
                                    text: '❌ Отклонить заказ',
                                    callback_data: refuse_order_callback + chat.id
                                }]
                            ]
                        }
                    }).then(() => {
                        bot.sendMessage(chat.id, abonementrequest_sended, {
                            reply_markup: {
                                keyboard: unregistered_keyboard[3],
                                resize_keyboard: true
            
                            }
                        })
                    })
                })
            })
            
        })
    }

    if (temp_link[4] === 'onetime'){
        console.log('!onetime')
        programme_pas[chat.id] = 'Fitness/' + temp_link[1] + '/Program/categories/' + temp_link[2] + '/programmes/' + temp_link[3] + '/types/' + temp_link[4]

        let discount = fb.database().ref('Fitness/' + temp_link[1] + '/discounts/')
        discount.get().then((result) =>{

            discountvalues[chat.id][0] = result.val().goodvalue
            discountvalues[chat.id][1] = result.val().middlevalue
            discountvalues[chat.id][2] = result.val().badvalue
            discountvalues[chat.id][3] = result.val().maxvalue

            suggestgoodskidka_text[chat.id][2] = '👋 Привет еще раз. Слушай, мы тут подумали и решили подарить тебе <b>'+ discountvalues[chat.id][0] +'% скидку на абонемент по твоей программе.</b> Не упусти свой шанс!'
            suggestmiddleskidka_text[chat.id][2] = '👋 Привет еще раз. Слушай, мы тут подумали и решили подарить тебе <b>'+ discountvalues[chat.id][1] +'% скидку на абонемент по твоей программе.</b> Обещаем учесть и устранить все недочеты!'
            suggestbadskidka_text[chat.id][2] = '👋 Привет еще раз. Нам действительно жаль, что тебе не понравилась тренировка. Наши сотрудники уже работают над этим. А пока, что думаешь насчет скидки в <b>'+ discountvalues[chat.id][2] +'% на абонемент по твоей программе.</b> Дай нам еще один шанс 🥺'
        })
        let anal = fb.database().ref('Fitness/' + temp_link[1] + '/analytics/current_data/audience/conversions/')
        anal.get().then((an) =>{
            let mini_update = {}
            mini_update['Fitness/' + temp_link[1] + '/analytics/current_data/audience/conversions/onetime'] = (an.val().onetime + 1)
            fb.database().ref().update(mini_update)
        })
        bot.sendSticker(chat.id, sticker_trainstarted[Math.floor(Math.random() * sticker_trainstarted.length)])
        .then(() => {
            bot.sendMessage(chat.id, 'Тренировка началась! Покажи это сообщение сотруднику клуба и вперед 👍', {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }]
                    ]
                }
            }).then(res => {
                messages_todelete[chat.id][5] = res.message_id
            })
        })
        

        deelay[chat.id](/* 10000 */ 7200000 ).then(() => 
        {
            bot.deleteMessage(chat.id, messages_todelete[chat.id][5])
            .catch(err => {messages_todelete[chat.id][5] = null})
            .then(() => {messages_todelete[chat.id][5] = null})

            bot.sendPoll(chat.id, howdoyoulikeourtraining_text , feedback_options, 
                {
                    is_anonymous: false
                })
        })
    }

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
            club: 'club_name: ' + club_name_fb[current_chat],
            error_text: err.message.toString(),
            error_stack: err.stack.toString()
        }
        updates['Motherbase/logger/uncaughtException/' + counter.length] = newreport
        fb.database().ref().update(updates)
        let mb_data = fb.database().ref('Motherbase/chats/')
        mb_data.get().then((result) => {
            let err_txt = `<b>⚠️ ВНИМАНИЕ ⚠️</b>
В работе скрипта FITNESS произошла ошибка.

<b>ℹ️ Общая информация: </b>
├ Клуб: `+ club_name_fb[current_chat] + `
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