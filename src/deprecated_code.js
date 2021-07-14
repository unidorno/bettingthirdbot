function PointsKeyboard(points_keyboard, userPoints, userCity, fb, bot, chat, change_city_text, choosepoint_text, message_id){
    let keyboard_buttons = 0
/*     category_keyboard = []
    userCategories = []
    categories_count = 0
    //categories_count = []
    //userCategories = []
    userCategories = []
    //category_keyboard = []
    category_keyboard = [] */
    let points_data = fb.database().ref('Basement/cities/'+ userCity +'/points/')
    points_data.get().then((snapshot) => {
        let points_array = Object.keys(snapshot.val())
        let userPointsNames = []
        console.log('categories_count: ' + chat + ' ' + points_array.length)     
        if (snapshot.exists()){
            for(let i = 0; i < points_array.length; i++){
                let point_name_data = fb.database().ref('Basement/cities/'+ userCity +'/points/' + points_array[i] + '/point_name')
                point_name_data.get().then((snapshot) => {
                    userPoints[i] = points_array[i]
                    userPointsNames[i] = snapshot.val()
                    console.log('point #' + i + ' = ' + userPoints[i])
                    if (i === points_array.length-1){
                        points_keyboard = []
                        let minuser = 0
                        console.log('point last = #' + i + ' = ' + userPointsNames[i])
                        // points_array.length++
                        points_keyboard[0] = [{
                            text: change_city_text,
                            callback_data: change_city_text
                        }]
                        for (let i = 1; i < points_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === points_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userPoints[i-1])
                                points_keyboard[i-minuser] = [{
                                    text: userPointsNames[i-1],
                                    callback_data: userPoints[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === points_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat, message_id).catch(err => {console.log('here: ' + err)})
                                        .then(() => {
                                            bot.sendMessage(chat, choosepoint_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                        })

                                }
                            }
                            else if (keyboard_buttons === points_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.deleteMessage(chat, message_id).catch(err => {console.log('here: ' + err)})
                                .then(() => {
                                    bot.sendMessage(chat, choosepoint_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:points_keyboard
                                            }
                                        })
                                })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userPoints[i-1] + '. Вторая кнопка: ' + userPoints[i])
                                points_keyboard[i - minuser] = [{
                                    text: userPointsNames[i-1],
                                    callback_data: userPoints[i-1]
                                },
                                    {
                                        text: userPointsNames[i],
                                        callback_data: userPoints[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === points_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat, message_id).catch(err => {console.log('here: ' + err)})
                                    .then(() => {
                                        bot.sendMessage(chat, choosepoint_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:points_keyboard
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

bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id
    current_chat = chatId
    console.log(msg)
    userstatus[chatId] = 'registered'
    if (chatId !== operators_chat[chatId]){  
        if (userstatus[chatId] === 'registered'){
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
                .then(() => {
                    let userdata = fb.database().ref('Fitness/')
                    userdata.get().then((result) => 
                    {
                        let clubs = Object.keys(result.val())
                        for (let i = 0; i < clubs.length; i++){
                            if (msg.text === '/start ' + clubs[i] + '_start'){
                                let temp = (msg.text).split(' ')
                                temp[1] = (msg.text).split('_')
                                club_name[chatId] = temp[1][0]
                                console.log(club_name[chatId])
                                if (temp[1][1] === 'start'){
                                    StartTraining(msg.chat.id, msg.message_id)
                                }
                            }
                        }
                    })
                    
                })
            })
        }
        else {
            Reset(current_chat)
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                anotherpoint_multiple[chatId] = 2
                bot.sendMessage(chatId, hellomessage_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.main_menu_keyboard
                    }
                })
            })
        }
        
        
    }
    if (chatId === operators_chat[chatId]){
        bot.sendMessage(chatId, 'Привет! Я буду скидывать сюда заказы. Чтобы начать выполнять заказ, нажмите на кнопку "✅ Принять", под заказом. Так клиент поймет, что его заказ принят.')
    }
})

function PointsKeyboard(points_keyboard, userPoints, UserDelCat, fb, bot, chat, change_delcat_text, choosepoint_text, user_mode, sendlocation){
    let keyboard_buttons = 0

    let isdelivery = 0
    if (user_mode === 'delivery_menu') isdelivery = 1
    let points_data = fb.database().ref('Delivery/' + UserDelCat)
    points_data.get().then((snapshot) => {
        let points_array = Object.keys(snapshot.val())
        let userPointsNames = []
        console.log('points_count: ' + chat + ' ' + points_array.length)
        if (snapshot.exists()){
            //userPoints = []
            //userPointsNames = []
            points_keyboard = []
            keyboard_buttons = 0
            if (isdelivery === 1){
                console.log('!delivery')
                let temp_var = 0
                for(let i = 0; i < points_array.length; i++){
                    console.log('!delivery_ ' + i)
                    let point_name_data = fb.database().ref('Delivery/' + UserDelCat + '/' + points_array[i] /*  + '/point_name' */)
                    point_name_data.get().then((res) => {
                        console.log('i = ' + i + ', points_array.length-1: ' + (points_array.length-1))
                        if (res.val().category_name === undefined || res.val().category_name === null && i < points_array.length - 1){
                            if (res.val().point_name !== undefined){
                                console.log('wge ' + res.val().point_name)
                                userPoints[temp_var] = points_array[i]
                                userPointsNames[temp_var] = res.val().point_name
                                console.log('point #' + i + ' = ' + userPointsNames[temp_var])
                                temp_var++
                            }
                        }
                        if (/* res.val().category_name === undefined || res.val().category_name === null && */ i === points_array.length-1){
                            let minuser = 0
                            console.log('=')
                            if ((res.val().category_name === undefined || res.val().category_name === null) && res.val().point_name !== undefined){
                                userPoints[temp_var] = points_array[i]
                                userPointsNames[temp_var] = res.val().point_name
                                //console.log('city #' + i + ' = ' + userPointsNames[i+1])
                                
                                console.log('point last = #' + i + ' = ' + userPointsNames[temp_var])
                                // points_count++
                            }
                                points_keyboard[0] = [{
                                    text: change_delcat_text,
                                    callback_data: change_delcat_text
                                }]
                                for (let i = 0; i < userPoints.length; i=i+2){
                                    console.log('catr: ' + i)
                                    if (i === userPoints.length - 1){
                                        console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userPoints[i])
                                        points_keyboard[i-minuser] = [{
                                            text: userPointsNames[i],
                                            callback_data: userPoints[i]
                                        }]
                                        keyboard_buttons++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userPoints.length){
                                            console.log('last element of points has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosepoint_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                            
        
                                        }
                                    }
                                    else if (keyboard_buttons === userPoints.length - 1){
                                        console.log('last element of points has be written, so lets send this keyboard')
                                        bot.sendMessage(chat, choosepoint_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                inline_keyboard:points_keyboard
                                                }
                                            })
                                    }
                                    else {
                                        console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userPoints[i] + '. Вторая кнопка: ' + userPoints[i+1])
                                        points_keyboard[i - minuser] = [{
                                            text: userPointsNames[i],
                                            callback_data: userPoints[i]
                                        },
                                            {
                                                text: userPointsNames[i+1],
                                                callback_data: userPoints[i+1]
                                            }]
                                        keyboard_buttons = keyboard_buttons + 2
                                        minuser++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userPoints.length - 1){
                                            console.log('last element of points has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosepoint_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                        }
                                    }
                                }
                            
                            
                        }
                    })
                }
            }

            else if (isdelivery === 0){
                console.log('!samovivoz')
                let temp_var = 0
                for(let i = 0; i < points_array.length; i++){
                    let point_name_data = fb.database().ref('Delivery/cities/' + UserDelCat + '/points/' + points_array[i])
                    point_name_data.get().then((snapshot) => {
                        if (snapshot.val().is_waiter === true && i < points_array.length - 1){
                            userPoints[temp_var] = points_array[i]
                            userPointsNames[temp_var] = snapshot.val().point_name
                            console.log('point #' + i + ' = ' + userPointsNames[temp_var])
                            temp_var++
                        }
                        if (i === points_array.length-1){
                            if (snapshot.val().is_waiter === true){
                                userPoints[temp_var] = points_array[i]
                                userPointsNames[temp_var] = snapshot.val().point_name
                                //console.log('city #' + i + ' = ' + userPointsNames[i+1])
                                let minuser = 0
                                console.log('point last = #' + i + ' = ' + userPointsNames[temp_var])
                                // points_count++
                                points_keyboard[0] = [{
                                    text: change_delcat_text,
                                    callback_data: change_delcat_text
                                },
                                {
                                    text: sendlocation,
                                    callback_data: sendlocation
                                }]
                                for (let i = 1; i < userPoints.length; i=i+2){
                                    console.log('catr: ' + i)
                                    if (i === userPoints.length - 1){
                                        console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userPoints[i])
                                        points_keyboard[i-minuser] = [{
                                            text: userPointsNames[i],
                                            callback_data: userPoints[i]
                                        }]
                                        keyboard_buttons++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userPoints.length - 1){
                                            console.log('last element of points has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosepoint_text + '. Вы также можете отправить свою геопозицию и мы найдем близжайшее заведение',
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                            
        
                                        }
                                    }
                                    else if (keyboard_buttons === userPoints.length - 1){
                                        console.log('last element of points has be written, so lets send this keyboard')
                                        bot.sendMessage(chat, choosepoint_text + '. Вы также можете отправить свою геопозицию и мы найдем близжайшее заведение',
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                inline_keyboard:points_keyboard
                                                }
                                            })
                                    }
                                    else {
                                        console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userPoints[i] + '. Вторая кнопка: ' + userPoints[i+1])
                                        points_keyboard[i - minuser] = [{
                                            text: userPointsNames[i],
                                            callback_data: userPoints[i]
                                        },
                                            {
                                                text: userPointsNames[i+1],
                                                callback_data: userPoints[i+1]
                                            }]
                                        keyboard_buttons = keyboard_buttons + 2
                                        minuser++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userPoints.length - 1){
                                            console.log('last element of points has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosepoint_text + '. Вы также можете отправить свою геопозицию и мы найдем близжайшее заведение',
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                        }
                                    }
                                }
                            }
                            if (snapshot.val().is_waiter === false){
                                if (userPoints.length < 2){
                                    bot.sendMessage(chat, 'Нам очень жаль, но в этом городе нет возможности самовывоза 😕',
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard:[
                                                [{
                                                    text: change_delcat_text,
                                                    callback_data: change_delcat_text
                                                }]
                                            ]
                                        }
                                    })
                                }
                                else {
                                    let minuser = 0
                                console.log('point last = #' + i + ' = ' + userPointsNames[temp_var])
                                // points_count++
                                points_keyboard[0] = [{
                                    text: change_delcat_text,
                                    callback_data: change_delcat_text
                                }]
                                for (let i = 1; i < userPoints.length; i=i+2){
                                    console.log('catr: ' + i)
                                    if (i === userPoints.length - 1){
                                        console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userPoints[i])
                                        points_keyboard[i-minuser] = [{
                                            text: userPointsNames[i],
                                            callback_data: userPoints[i]
                                        }]
                                        keyboard_buttons++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userPoints.length - 1){
                                            console.log('last element of points has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosepoint_text + '. Вы также можете отправить свою геопозицию и мы найдем близжайшее заведение',
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                            
        
                                        }
                                    }
                                    else if (keyboard_buttons === userPoints.length - 1){
                                        console.log('last element of points has be written, so lets send this keyboard')
                                        bot.sendMessage(chat, choosepoint_text + '. Вы также можете отправить свою геопозицию и мы найдем близжайшее заведение',
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                inline_keyboard:points_keyboard
                                                }
                                            })
                                    }
                                    else {
                                        console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userPoints[i] + '. Вторая кнопка: ' + userPoints[i+1])
                                        points_keyboard[i - minuser] = [{
                                            text: userPointsNames[i],
                                            callback_data: userPoints[i]
                                        },
                                            {
                                                text: userPointsNames[i+1],
                                                callback_data: userPoints[i+1]
                                            }]
                                        keyboard_buttons = keyboard_buttons + 2
                                        minuser++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userPoints.length - 1){
                                            console.log('last element of points has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosepoint_text + '. Вы также можете отправить свою геопозицию и мы найдем близжайшее заведение',
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:points_keyboard
                                                    }
                                                })
                                        }
                                    }
                                }
                                }
                            }
                            
                        }
                    })
                }
            }
        }
    })
}