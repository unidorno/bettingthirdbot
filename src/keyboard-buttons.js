
//В этом скрипте создаются клавиатуры

//Шаблон клавиатуры (для админа заведения)
const hello_keyboard_text = [['Как это работает?', 'howitworkshmsg_cb'], ['Правила', 'ourrules_cb'], ['Продолжить', 'continuehmstx_cb']]
const hello_keyboard = [
    [{
        text: hello_keyboard_text[0][0],
        callback_data: hello_keyboard_text[0][1]
    }],
    [{
        text: hello_keyboard_text[1][0],
        callback_data: hello_keyboard_text[1][1]
    }],
    [{
        text: hello_keyboard_text[2][0],
        callback_data: hello_keyboard_text[2][1]
    }]
]

const menu_keyboard_text = [['ℹ️ FAQ', 'faq_cb'], ['👀 Моя анкета', 'myblnkmnbn_cb'], ['💰 Пополнить баланс', 'addmnfrmmn_cb'], ['🔍 Найти пару','fndhrbtn_cb'], ['☑️ Безопасная переписка','sfmdnmn_cb']]
const menu_keyboard = [
    [{
        text: menu_keyboard_text[0][0],
        callback_data: menu_keyboard_text[0][1]
    },
    {
        text: menu_keyboard_text[1][0],
        callback_data: menu_keyboard_text[1][1]
    }],
    [{
        text: menu_keyboard_text[2][0],
        callback_data: menu_keyboard_text[2][1]
    }],
    [{
        text: menu_keyboard_text[3][0],
        callback_data: menu_keyboard_text[3][1]
    }],
    [{
        text: menu_keyboard_text[4][0],
        callback_data: menu_keyboard_text[4][1]
    }]
]


module.exports = {
    hello_keyboard_text,
    hello_keyboard,
    menu_keyboard_text,
    menu_keyboard
}