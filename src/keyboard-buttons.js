process.on('uncaughtException', function (err) {
    console.log(err);
  });

function ProgramCategoriesKeyboard(category_keyboard, userCategories, fb, bot, chat, backtomain_text, choosecategory_text, club_name_fb){
    let keyboard_buttons = 0
    let categories_data = fb.database().ref('Fitness/'+club_name_fb+'/Program/categories/')
    categories_data.get().then((snapshot) => {
        let categories_array = Object.keys(snapshot.val())
        let userCategoriesNames = []
        console.log('categories_count: ' + chat + ' ' + categories_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < categories_array.length; i++){
                let category_name_data = fb.database().ref('Fitness/'+club_name_fb+'/Program/categories/' + categories_array[i] + '/category_name')
                category_name_data.get().then((snapshot) => {
                    userCategories[i] = categories_array[i]
                    userCategoriesNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userCategoriesNames[i])
                    if (i === categories_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userCategoriesNames[i])
                        // categories_count++
                        category_keyboard[0] = [{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }]
                        for (let i = 1; i < categories_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === categories_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCategories[i-1])
                                category_keyboard[i-minuser] = [{
                                    text: userCategoriesNames[i-1],
                                    callback_data: userCategories[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === categories_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosecategory_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:category_keyboard
                                            }
                                        })
                                    

                                }
                            }
                            else if (keyboard_buttons === categories_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat, choosecategory_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                        inline_keyboard:category_keyboard
                                        }
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCategories[i] + '. Вторая кнопка: ' + userCategories[i+1])
                                category_keyboard[i - minuser] = [{
                                    text: userCategoriesNames[i-1],
                                    callback_data: userCategories[i-1]
                                },
                                    {
                                        text: userCategoriesNames[i],
                                        callback_data: userCategories[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === categories_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosecategory_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:category_keyboard
                                            }
                                        })
                                }
                            }
                        }
                    }
                })
            }
        }
    })
}

function ProgramKeyboard(programmes_keyboard, userProgrammesList, userCategory, fb, bot, chat, message_id, anothercategory_text, chooseprogramme_text, club_name_fb){
    let keyboard_buttons = 0 
    console.log('category: ' + userCategory)
    let categories_data = fb.database().ref('Fitness/'+club_name_fb+'/Program/categories/' + userCategory + '/programmes/')
    categories_data.get().then((snapshot) => {
        let programmes_array = Object.keys(snapshot.val())
        let userProgrammesNames = []
        console.log('foodlist_count: ' + programmes_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < programmes_array.length; i++){
                let programm_name_data = fb.database().ref('Fitness/'+club_name_fb+'/Program/categories/' + userCategory + '/programmes/' + programmes_array[i] + '/name')
                programm_name_data.get().then((snapshot) => {
                    userProgrammesList[i] = programmes_array[i]
                    userProgrammesNames[i] = snapshot.val()
                    console.log('food #' + i + ' = ' + userProgrammesList[i])
                    if (i === programmes_array.length-1){
                        programmes_keyboard = []
                        let minuser = 0
                        console.log('food last = #' + i + ' = ' + userProgrammesList[i])
                        // foodlist_count++
                        programmes_keyboard[0] = [{
                            text: anothercategory_text,
                            callback_data: anothercategory_text
                        }]
                        for (let i = 1; i < programmes_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === programmes_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userProgrammesList[i-1])
                                programmes_keyboard[i-minuser] = [{
                                    text: userProgrammesNames[i-1],
                                    callback_data: userProgrammesList[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === programmes_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                        bot.sendMessage(chat.id, chooseprogramme_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:programmes_keyboard
                                                }
                                            })
                                    })
                                    

                                }
                            }
                            else if (keyboard_buttons === programmes_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                    bot.sendMessage(chat.id, chooseprogramme_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:programmes_keyboard
                                            }
                                        })
                                })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userProgrammesList[i-1] + '. Вторая кнопка: ' + userProgrammesList[i])
                                programmes_keyboard[i - minuser] = [{
                                    text: userProgrammesNames[i-1],
                                    callback_data: userProgrammesList[i-1]
                                },
                                    {
                                        text: userProgrammesNames[i],
                                        callback_data: userProgrammesList[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === programmes_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                        bot.sendMessage(chat.id, chooseprogramme_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:programmes_keyboard
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
    })
}

function TrenersKeyboard(trener_keyboard, userTreners, fb, bot, chat, backtomain_text, choosetrener_text, club_name_fb){
    let keyboard_buttons = 0
    let treners_data = fb.database().ref('Fitness/'+club_name_fb+'/treners/')
    treners_data.get().then((snapshot) => {
        let treners_array = Object.keys(snapshot.val())
        let userTrenerNames = []
        console.log('categories_count: ' + chat + ' ' + treners_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < treners_array.length; i++){
                let trener_name_data = fb.database().ref('Fitness/'+club_name_fb+'/treners/' + treners_array[i] + '/name')
                trener_name_data.get().then((snapshot) => {
                    userTreners[i] = treners_array[i]
                    userTrenerNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userTrenerNames[i])
                    if (i === treners_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userTrenerNames[i])
                        // categories_count++
                        trener_keyboard[0] = [{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }]
                        for (let i = 1; i < treners_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === treners_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userTreners[i-1])
                                trener_keyboard[i-minuser] = [{
                                    text: userTrenerNames[i-1],
                                    callback_data: userTreners[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === treners_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosetrener_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:trener_keyboard
                                            }
                                        })
                                    

                                }
                            }
                            else if (keyboard_buttons === treners_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat, choosetrener_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                        inline_keyboard:trener_keyboard
                                        }
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userTreners[i] + '. Вторая кнопка: ' + userTreners[i+1])
                                trener_keyboard[i - minuser] = [{
                                    text: userTrenerNames[i-1],
                                    callback_data: userTreners[i-1]
                                },
                                    {
                                        text: userTrenerNames[i],
                                        callback_data: userTreners[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === treners_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosetrener_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:trener_keyboard
                                            }
                                        })
                                }
                            }
                        }
                    }
                })
            }
        }
    })
}

function GymsKeyboard(gym_keyboard, userGyms, fb, bot, chat, mother_link, choosegym_text){
    let keyboard_buttons = 0
    let gyms_data = fb.database().ref('Fitness/')
    gyms_data.get().then((snapshot) => {
        let gyms_array = Object.keys(snapshot.val())
        let userGymNames = []
        console.log('categories_count: ' + chat + ' ' + gyms_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < gyms_array.length; i++){
                let gym_name_data = fb.database().ref('Fitness/' + gyms_array[i] + '/club_name')
                gym_name_data.get().then((snapshot) => {
                    userGyms[i] = gyms_array[i]
                    userGymNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userGymNames[i])
                    if (i === gyms_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userGymNames[i])
                        // categories_count++
                        gym_keyboard[0] = [{
                            text: 'ctOS 🤖',
                            url: mother_link
                        }]
                        for (let i = 1; i < gyms_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === gyms_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userGyms[i-1])
                                gym_keyboard[i-minuser] = [{
                                    text: userGymNames[i-1],
                                    callback_data: userGyms[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === gyms_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosegym_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:gym_keyboard
                                            }
                                        })
                                    

                                }
                            }
                            else if (keyboard_buttons === gyms_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat, choosegym_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                        inline_keyboard:gym_keyboard
                                        }
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userGyms[i] + '. Вторая кнопка: ' + userGyms[i+1])
                                gym_keyboard[i - minuser] = [{
                                    text: userGymNames[i-1],
                                    callback_data: userGyms[i-1]
                                },
                                    {
                                        text: userGymNames[i],
                                        callback_data: userGyms[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === gyms_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosegym_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:gym_keyboard
                                            }
                                        })
                                }
                            }
                        }
                    }
                })
            }
        }
    })
}

function ShopCategoriesKeyboard(shop_keyboard, userShopCategories, fb, bot, chat, backtomain_text, chooseshopcategory_text, club_name_fb){
    let keyboard_buttons = 0
    let shops = fb.database().ref('Fitness/'+club_name_fb+'/shop/categories/')
    shops.get().then((snapshot) => {
        let items_array = Object.keys(snapshot.val())
        let userItemNames = []
        console.log('categories_count: ' + chat + ' ' + items_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < items_array.length; i++){
                let item_name_data = fb.database().ref('Fitness/'+club_name_fb+'/shop/categories/' + items_array[i] + '/category_name')
                item_name_data.get().then((snapshot) => {
                    userShopCategories[i] = items_array[i]
                    userItemNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userItemNames[i])
                    if (i === items_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userItemNames[i])
                        // categories_count++
                        shop_keyboard[0] = [{
                            text: backtomain_text,
                            callback_data: backtomain_text
                        }]
                        for (let i = 1; i < items_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === items_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userShopCategories[i-1])
                                shop_keyboard[i-minuser] = [{
                                    text: userItemNames[i-1],
                                    callback_data: userShopCategories[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === items_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, chooseshopcategory_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:shop_keyboard
                                            }
                                        })
                                    

                                }
                            }
                            else if (keyboard_buttons === items_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat, chooseshopcategory_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                        inline_keyboard:shop_keyboard
                                        }
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userShopCategories[i] + '. Вторая кнопка: ' + userShopCategories[i+1])
                                shop_keyboard[i - minuser] = [{
                                    text: userItemNames[i-1],
                                    callback_data: userShopCategories[i-1]
                                },
                                    {
                                        text: userItemNames[i],
                                        callback_data: userShopCategories[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === items_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, chooseshopcategory_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:shop_keyboard
                                            }
                                        })
                                }
                            }
                        }
                    }
                })
            }
        }
    })
}

function ShopItemsKeyboard(shopitems_keyboard, userItemsList, userShopCategory, fb, bot, chat, message_id, anothershopcategory_text, chooseitem_text, club_name_fb){
    let keyboard_buttons = 0 
    console.log('category: ' + userShopCategory)
    let items_data = fb.database().ref('Fitness/'+club_name_fb+'/shop/categories/' + userShopCategory + '/items/')
    items_data.get().then((snapshot) => {
        let items_array = Object.keys(snapshot.val())
        let userItemsNames = []
        console.log('foodlist_count: ' + items_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < items_array.length; i++){
                let items_name_data = fb.database().ref('Fitness/'+club_name_fb+'/shop/categories/' + userShopCategory + '/items/' + items_array[i] + '/name')
                items_name_data.get().then((snapshot) => {
                    userItemsList[i] = items_array[i]
                    userItemsNames[i] = snapshot.val()
                    console.log('food #' + i + ' = ' + userItemsList[i])
                    if (i === items_array.length-1){
                        shopitems_keyboard = []
                        let minuser = 0
                        console.log('food last = #' + i + ' = ' + userItemsList[i])
                        // foodlist_count++
                        shopitems_keyboard[0] = [{
                            text: anothershopcategory_text,
                            callback_data: anothershopcategory_text
                        }]
                        for (let i = 1; i < items_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === items_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userItemsList[i-1])
                                shopitems_keyboard[i-minuser] = [{
                                    text: userItemsNames[i-1],
                                    callback_data: userItemsList[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === items_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                        bot.sendMessage(chat.id, chooseitem_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:shopitems_keyboard
                                                }
                                            })
                                    })
                                    

                                }
                            }
                            else if (keyboard_buttons === items_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                    bot.sendMessage(chat.id, chooseitem_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:shopitems_keyboard
                                            }
                                        })
                                })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userItemsList[i-1] + '. Вторая кнопка: ' + userItemsList[i])
                                shopitems_keyboard[i - minuser] = [{
                                    text: userItemsNames[i-1],
                                    callback_data: userItemsList[i-1]
                                },
                                    {
                                        text: userItemsNames[i],
                                        callback_data: userItemsList[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === items_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                        bot.sendMessage(chat.id, chooseitem_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:shopitems_keyboard
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
    })
}

const main_menu_buttons = [['Мой абонемент 💳', 'my_abonement_query'], ['Программы 🤼‍♂️','programmes_query'], ['Тренеры 🧔🏻','treners_query'], ['Магазин 🛍','shop_query']]
const main_menu_keyboard = [
    [{
        text: main_menu_buttons[0][0],
        callback_data: main_menu_buttons[0][1]
    }],
    [{
        text: main_menu_buttons[1][0],
        callback_data: main_menu_buttons[1][1]
    }],
    [{
        text: main_menu_buttons[2][0],
        callback_data: main_menu_buttons[2][1]
    },{
        text: main_menu_buttons[3][0],
        callback_data: main_menu_buttons[3][1]
    }]
]

module.exports = {
    ProgramKeyboard,
    ProgramCategoriesKeyboard,
    TrenersKeyboard,
    GymsKeyboard,
    ShopCategoriesKeyboard,
    ShopItemsKeyboard,
    main_menu_keyboard,
    main_menu_buttons
}