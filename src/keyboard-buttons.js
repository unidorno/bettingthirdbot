process.on('uncaughtException', function (err) {
    console.log('here: ' + err);
  });

function CitiesKeyboard(cities_keyboard, userCities, fb, bot, chat, choosecity_text, anotherusermode_text, user_mode){
    let keyboard_buttons = 0
/*     category_keyboard = []
    userCategories = []
    categories_count = 0
    //categories_count = []
    //userCategories = []
    userCategories = []
    //category_keyboard = []
    category_keyboard = [] */
    let isdelivery = 0
    if (user_mode === 'delivery_menu') isdelivery = 1
    let cities_data = fb.database().ref('Basement/cities/')
    cities_data.get().then((snapshot) => {
        let cities_array = Object.keys(snapshot.val())
        let userCitiesNames = []
        console.log('categories_count: ' + chat + ' ' + cities_array.length)
        if (snapshot.exists()){
            //userCities = []
            //userCitiesNames = []
            cities_keyboard = []
            keyboard_buttons = 0
            if (isdelivery === 1){
                console.log('!delivery')
                let temp_var = 0
                for(let i = 0; i < cities_array.length; i++){
                    let city_name_data = fb.database().ref('Basement/cities/' + cities_array[i]/*  + '/city_name' */)
                    city_name_data.get().then((snapshot) => {
                        if (snapshot.val().is_deliver === true && i < cities_array.length - 1){
                            userCities[temp_var+1] = cities_array[i]
                            userCitiesNames[temp_var+1] = snapshot.val().city_name
                            console.log('city #' + i + ' = ' + userCitiesNames[temp_var+1])
                            temp_var++
                        }
                        if (i === cities_array.length-1){
                            if (snapshot.val().is_deliver === true){
                                userCities[temp_var+1] = cities_array[i]
                                userCitiesNames[temp_var+1] = snapshot.val().city_name
                                //console.log('city #' + i + ' = ' + userCitiesNames[i+1])
                                let minuser = 0
                                console.log('city last = #' + i + ' = ' + userCitiesNames[temp_var+1])
                                // categories_count++
                                cities_keyboard[0] = [{
                                    text: anotherusermode_text,
                                    callback_data: anotherusermode_text
                                }]
                                for (let i = 1; i < userCities.length; i=i+2){
                                    console.log('catr: ' + i)
                                    if (i === userCities.length - 1){
                                        console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCities[i])
                                        cities_keyboard[i-minuser] = [{
                                            text: userCitiesNames[i],
                                            callback_data: userCities[i]
                                        }]
                                        keyboard_buttons++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userCities.length - 1){
                                            console.log('last element of cities has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosecity_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:cities_keyboard
                                                    }
                                                })
                                            
        
                                        }
                                    }
                                    else if (keyboard_buttons === userCities.length - 1){
                                        console.log('last element of cities has be written, so lets send this keyboard')
                                        bot.sendMessage(chat, choosecity_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                inline_keyboard:cities_keyboard
                                                }
                                            })
                                    }
                                    else {
                                        console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCities[i] + '. Вторая кнопка: ' + userCities[i+1])
                                        cities_keyboard[i - minuser] = [{
                                            text: userCitiesNames[i],
                                            callback_data: userCities[i]
                                        },
                                            {
                                                text: userCitiesNames[i+1],
                                                callback_data: userCities[i+1]
                                            }]
                                        keyboard_buttons = keyboard_buttons + 2
                                        minuser++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userCities.length - 1){
                                            console.log('last element of cities has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosecity_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:cities_keyboard
                                                    }
                                                })
                                        }
                                    }
                                }
                            }
                            if (snapshot.val().is_deliver === false){
                                if (userCities.length < 2){
                                    bot.sendMessage(chat, 'Нам очень жаль, но в этом городе нет доставки 😕',
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard:[
                                                [{
                                                    text: anotherusermode_text,
                                                    callback_data: anotherusermode_text
                                                }]
                                            ]
                                        }
                                    })
                                }
                                else {
                                    let minuser = 0
                                    //console.log('city last = #' + i + ' = ' + userCitiesNames[temp_var+1])
                                    // categories_count++
                                    cities_keyboard[0] = [{
                                        text: anotherusermode_text,
                                        callback_data: anotherusermode_text
                                    }]
                                    for (let i = 1; i < userCities.length; i=i+2){
                                        console.log('catr: ' + i)
                                        if (i === userCities.length - 1){
                                            console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCities[i])
                                            cities_keyboard[i-minuser] = [{
                                                text: userCitiesNames[i],
                                                callback_data: userCities[i]
                                            }]
                                            keyboard_buttons++
                                            console.log('keyboard_buttons: ' + keyboard_buttons)
                                            if (keyboard_buttons === userCities.length - 1){
                                                console.log('last element of cities has be written, so lets send this keyboard')
                                                bot.sendMessage(chat, choosecity_text,
                                                    {
                                                        parse_mode: 'HTML',
                                                        reply_markup:{
                                                            inline_keyboard:cities_keyboard
                                                        }
                                                    })
                                                
            
                                            }
                                        }
                                        else if (keyboard_buttons === userCities.length - 1){
                                            console.log('last element of cities has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosecity_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                    inline_keyboard:cities_keyboard
                                                    }
                                                })
                                        }
                                        else {
                                            console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCities[i] + '. Вторая кнопка: ' + userCities[i+1])
                                            cities_keyboard[i - minuser] = [{
                                                text: userCitiesNames[i],
                                                callback_data: userCities[i]
                                            },
                                                {
                                                    text: userCitiesNames[i+1],
                                                    callback_data: userCities[i+1]
                                                }]
                                            keyboard_buttons = keyboard_buttons + 2
                                            minuser++
                                            console.log('keyboard_buttons: ' + keyboard_buttons)
                                            if (keyboard_buttons === userCities.length - 1){
                                                console.log('last element of cities has be written, so lets send this keyboard')
                                                bot.sendMessage(chat, choosecity_text,
                                                    {
                                                        parse_mode: 'HTML',
                                                        reply_markup:{
                                                            inline_keyboard:cities_keyboard
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

            else if (isdelivery === 0){
                console.log('!samovivoz')
                let temp_var = 0
                for(let i = 0; i < cities_array.length; i++){
                    let city_name_data = fb.database().ref('Basement/cities/' + cities_array[i]/*  + '/city_name' */)
                    city_name_data.get().then((snapshot) => {
                        if (snapshot.val().is_waiter === true && i < cities_array.length - 1){
                            userCities[temp_var+1] = cities_array[i]
                            userCitiesNames[temp_var+1] = snapshot.val().city_name
                            console.log('city #' + i + ' = ' + userCitiesNames[temp_var+1])
                            temp_var++
                        }
                        if (i === cities_array.length-1){
                            if (snapshot.val().is_waiter === true){
                                userCities[temp_var+1] = cities_array[i]
                                userCitiesNames[temp_var+1] = snapshot.val().city_name
                                //console.log('city #' + i + ' = ' + userCitiesNames[i+1])
                                let minuser = 0
                                console.log('city last = #' + i + ' = ' + userCitiesNames[temp_var+1])
                                // categories_count++
                                cities_keyboard[0] = [{
                                    text: anotherusermode_text,
                                    callback_data: anotherusermode_text
                                }]
                                for (let i = 1; i < userCities.length; i=i+2){
                                    console.log('catr: ' + i)
                                    if (i === userCities.length - 1){
                                        console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCities[i])
                                        cities_keyboard[i-minuser] = [{
                                            text: userCitiesNames[i],
                                            callback_data: userCities[i]
                                        }]
                                        keyboard_buttons++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userCities.length - 1){
                                            console.log('last element of cities has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosecity_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:cities_keyboard
                                                    }
                                                })
                                            
        
                                        }
                                    }
                                    else if (keyboard_buttons === userCities.length - 1){
                                        console.log('last element of cities has be written, so lets send this keyboard')
                                        bot.sendMessage(chat, choosecity_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                inline_keyboard:cities_keyboard
                                                }
                                            })
                                    }
                                    else {
                                        console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCities[i] + '. Вторая кнопка: ' + userCities[i+1])
                                        cities_keyboard[i - minuser] = [{
                                            text: userCitiesNames[i],
                                            callback_data: userCities[i]
                                        },
                                            {
                                                text: userCitiesNames[i+1],
                                                callback_data: userCities[i+1]
                                            }]
                                        keyboard_buttons = keyboard_buttons + 2
                                        minuser++
                                        console.log('keyboard_buttons: ' + keyboard_buttons)
                                        if (keyboard_buttons === userCities.length - 1){
                                            console.log('last element of cities has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosecity_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:cities_keyboard
                                                    }
                                                })
                                        }
                                    }
                                }
                            }
                            if (snapshot.val().is_waiter === false){
                                if (userCities.length < 2){
                                    bot.sendMessage(chat, 'Нам очень жаль, но в этом городе нет самовывоза 😕',
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard:[
                                                [{
                                                    text: anotherusermode_text,
                                                    callback_data: anotherusermode_text
                                                }]
                                            ]
                                        }
                                    })
                                }
                                else {
                                    let minuser = 0
                                    //console.log('city last = #' + i + ' = ' + userCitiesNames[temp_var+1])
                                    // categories_count++
                                    cities_keyboard[0] = [{
                                        text: anotherusermode_text,
                                        callback_data: anotherusermode_text
                                    }]
                                    for (let i = 1; i < userCities.length; i=i+2){
                                        console.log('catr: ' + i)
                                        if (i === userCities.length - 1){
                                            console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCities[i])
                                            cities_keyboard[i-minuser] = [{
                                                text: userCitiesNames[i],
                                                callback_data: userCities[i]
                                            }]
                                            keyboard_buttons++
                                            console.log('keyboard_buttons: ' + keyboard_buttons)
                                            if (keyboard_buttons === userCities.length - 1){
                                                console.log('last element of cities has be written, so lets send this keyboard')
                                                bot.sendMessage(chat, choosecity_text,
                                                    {
                                                        parse_mode: 'HTML',
                                                        reply_markup:{
                                                            inline_keyboard:cities_keyboard
                                                        }
                                                    })
                                                
            
                                            }
                                        }
                                        else if (keyboard_buttons === userCities.length - 1){
                                            console.log('last element of cities has be written, so lets send this keyboard')
                                            bot.sendMessage(chat, choosecity_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                    inline_keyboard:cities_keyboard
                                                    }
                                                })
                                        }
                                        else {
                                            console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCities[i] + '. Вторая кнопка: ' + userCities[i+1])
                                            cities_keyboard[i - minuser] = [{
                                                text: userCitiesNames[i],
                                                callback_data: userCities[i]
                                            },
                                                {
                                                    text: userCitiesNames[i+1],
                                                    callback_data: userCities[i+1]
                                                }]
                                            keyboard_buttons = keyboard_buttons + 2
                                            minuser++
                                            console.log('keyboard_buttons: ' + keyboard_buttons)
                                            if (keyboard_buttons === userCities.length - 1){
                                                console.log('last element of cities has be written, so lets send this keyboard')
                                                bot.sendMessage(chat, choosecity_text,
                                                    {
                                                        parse_mode: 'HTML',
                                                        reply_markup:{
                                                            inline_keyboard:cities_keyboard
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

function DeliveryCatKeyboard(cat_keyboard, userCategory, fb, bot, chat, mother_link, choosecat_text, message_toedit, message_text){
    let keyboard_buttons = 0
    let delcat_data = fb.database().ref('Delivery/')
    delcat_data.get().then((snapshot) => {
        let cats_array = Object.keys(snapshot.val())
        let userCatNames = []
        console.log('categories_count: ' + chat + ' ' + cats_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < cats_array.length; i++){
                let cat_name_data = fb.database().ref('Delivery/' + cats_array[i] + '/category_name')
                cat_name_data.get().then((snapshot) => {
                    userCategory[i] = cats_array[i]
                    userCatNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userCatNames[i])
                    if (i === cats_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userCatNames[i])
                        // categories_count++
                        cat_keyboard[0] = [{
                            text: '🛍 Получить скидку 10%',
                            url: mother_link
                        }]
                        for (let i = 1; i < cats_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === cats_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCategory[i-1])
                                cat_keyboard[i-minuser] = [{
                                    text: userCatNames[i-1],
                                    callback_data: userCategory[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === cats_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosecat_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:cat_keyboard
                                            }
                                        })
                                        .then(res => {
                                            message_toedit[0] = res.message_id
                                            message_text[0] = res.text
                                        })
                                    

                                }
                            }
                            else if (keyboard_buttons === cats_array.length){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat, choosecat_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                        inline_keyboard:cat_keyboard
                                        }
                                    }).then(res => {
                                        message_toedit[0] = res.message_id
                                        message_text[0] = res.text
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCategory[i] + '. Вторая кнопка: ' + userCategory[i+1])
                                cat_keyboard[i - minuser] = [{
                                    text: userCatNames[i-1],
                                    callback_data: userCategory[i-1]
                                },
                                    {
                                        text: userCatNames[i],
                                        callback_data: userCategory[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === cats_array.length){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, choosecat_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:cat_keyboard
                                            }
                                        }).then(res => {
                                            message_toedit[0] = res.message_id
                                            message_text[0] = res.text
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

function PointsKeyboard(points_keyboard, userPoints, UserDelCat, fb, bot, chat, change_delcat_text, choosepoint_text, user_mode, sendlocation, message_toedit, message_text){
    let keyboard_buttons = 0

    let isdelivery = 1
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
                            let minuser = -1
                            points_keyboard[0] = [{
                                text: change_delcat_text,
                                callback_data: change_delcat_text
                            }]
                            console.log('=')
                            if ((res.val().category_name === undefined || res.val().category_name === null) && res.val().point_name !== undefined){
                                userPoints[temp_var] = points_array[i]
                                userPointsNames[temp_var] = res.val().point_name
                                //console.log('city #' + i + ' = ' + userPointsNames[i+1])
                                
                                console.log('point last = #' + i + ' = ' + userPointsNames[temp_var])
                                // points_count++
                            }
                                
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
                                                }
                                            )
                                            .then(res => {
                                                message_toedit[0] = res.message_id
                                                message_text[0] = res.text
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
                                            }).then(res => {
                                                message_toedit[0] = res.message_id
                                                message_text[0] = res.text
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
                                                }).then(res => {
                                                    message_toedit[0] = res.message_id
                                                    message_text[0] = res.text
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

function CategoriesKeyboard(category_keyboard, userCategories, fb, bot, chat, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, userDelCat, userPoint, user_mode, message_toedit, message_text){
    let keyboard_buttons = 0
/*     category_keyboard = []
    userCategories = []
    categories_count = 0
    //categories_count = []
    //userCategories = []
    userCategories = []
    //category_keyboard = []
    category_keyboard = [] */
    let categories_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/')
    categories_data.get().then((snapshot) => {
        let categories_array = Object.keys(snapshot.val())
        let userCategoriesNames = []
        console.log('categories_count: ' + chat + ' ' + categories_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < categories_array.length; i++){
                let category_name_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/' + categories_array[i] + '/category_name')
                category_name_data.get().then((snapshot) => {
                    userCategories[i] = categories_array[i]
                    userCategoriesNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userCategoriesNames[i])
                    if (i === categories_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userCategoriesNames[i])
                        // categories_count++
                        category_keyboard[0] = [{
                            text: anotherpoint_text,
                            callback_data: anotherpoint_text
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
                                        }).then(res => {
                                            message_toedit[0] = res.message_id
                                            message_text[0] = res.text
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
                                    .then(res => {
                                        message_toedit[0] = res.message_id
                                        message_text[0] = res.text
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
                                        .then(res => {
                                            message_toedit[0] = res.message_id
                                            message_text[0] = res.text
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

function FoodKeyboard(foodlist_keyboard, userFoodlist, foodlist_count, userCategory, fb, bot, chat, message_id, anothercategory_text, query, choosefood_text, userDelCat, userPoint, user_mode){
    let keyboard_buttons = 0
    //userFoodlist = []
    /*foodlist_keyboard = []
    foodlist_count = []
    userCategory = [] */
    let categories_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/' + userCategory + '/food/food_number')
    categories_data.get().then((snapshot) => {
        foodlist_count = snapshot.val()
        console.log('foodlist_count: ' + foodlist_count)
        if (snapshot.exists()){
            for(let i = 0; i < foodlist_count; i++){
                let food_name_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/' + userCategory + '/food/' + i + '/name')
                food_name_data.get().then((snapshot) => {
                    userFoodlist[i] = snapshot.val()
                    console.log('food #' + i + ' = ' + userFoodlist[i])
                    if (i === foodlist_count-1){
                        foodlist_keyboard = []
                        let minuser = 0
                        console.log('food last = #' + i + ' = ' + userFoodlist[i])
                        // foodlist_count++
                        foodlist_keyboard[0] = [{
                            text: anothercategory_text,
                            callback_data: anothercategory_text
                        }]
                        for (let i = 1; i < foodlist_count + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === foodlist_count){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userFoodlist[i-1])
                                foodlist_keyboard[i-minuser] = [{
                                    text: userFoodlist[i-1],
                                    callback_data: userFoodlist[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === foodlist_count){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                        bot.sendMessage(chat.id, choosefood_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:foodlist_keyboard
                                                }
                                            })
                                    })
                                    

                                }
                            }
                            else if (keyboard_buttons === foodlist_count){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                    bot.sendMessage(chat.id, choosefood_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:foodlist_keyboard
                                            }
                                        })
                                })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userFoodlist[i-1] + '. Вторая кнопка: ' + userFoodlist[i])
                                foodlist_keyboard[i - minuser] = [{
                                    text: userFoodlist[i-1],
                                    callback_data: userFoodlist[i-1]
                                },
                                    {
                                        text: userFoodlist[i],
                                        callback_data: userFoodlist[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === foodlist_count){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)}).then(() => {
                                        bot.sendMessage(chat.id, choosefood_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:foodlist_keyboard
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

function CategoriesKeyboardAdmin(category_keyboard, userCategories, fb, bot, chat, msg, anotherpoint_text, choosecategory_text, location_text, phone_text, userDelCat, userPoint, user_mode, message_toedit, message_text, openadminpanel){
    let keyboard_buttons = 0
/*     category_keyboard = []
    userCategories = []
    categories_count = 0
    //categories_count = []
    //userCategories = []
    userCategories = []
    //category_keyboard = []
    category_keyboard = [] */
    let categories_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/')
    categories_data.get().then((snapshot) => {
        let categories_array = Object.keys(snapshot.val())
        let userCategoriesNames = []
        console.log('categories_count: ' + chat + ' ' + categories_array.length)
        if (snapshot.exists()){
            for(let i = 0; i < categories_array.length; i++){
                let category_name_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/' + categories_array[i] + '/category_name')
                category_name_data.get().then((snapshot) => {
                    userCategories[i] = categories_array[i]
                    userCategoriesNames[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userCategoriesNames[i])
                    if (i === categories_array.length-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userCategoriesNames[i])
                        // categories_count++
                        category_keyboard[0] = [{
                            text: '◀️ Назад',
                            callback_data: openadminpanel
                        }]
                        for (let i = 1; i < categories_array.length + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === categories_array.length){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCategories[i-1])
                                category_keyboard[i-minuser] = [{
                                    text: userCategoriesNames[i-1],
                                    callback_data: userCategories[i-1] + '_admnctcb'
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
                                        }).then(res => {
                                            message_toedit[7] = res.message_id
                                            message_text[7] = res.text
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
                                    .then(res => {
                                        message_toedit[7] = res.message_id
                                        message_text[7] = res.text
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCategories[i] + '. Вторая кнопка: ' + userCategories[i+1])
                                category_keyboard[i - minuser] = [{
                                    text: userCategoriesNames[i-1],
                                    callback_data: userCategories[i-1] + '_admnctcb'
                                },
                                    {
                                        text: userCategoriesNames[i],
                                        callback_data: userCategories[i] + '_admnctcb'
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
                                        .then(res => {
                                            message_toedit[7] = res.message_id
                                            message_text[7] = res.text
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

function FoodKeyboardAdmin(foodlist_keyboard, userFoodlist, foodlist_count, userCategory, fb, bot, chat, message_id, anothercategory_text, query, choosefood_text, userDelCat, userPoint, user_mode, message_toedit, message_text){
    let keyboard_buttons = 0
    //userFoodlist = []
    /*foodlist_keyboard = []
    foodlist_count = []
    userCategory = [] */
    let categories_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/' + userCategory + '/food/food_number')
    categories_data.get().then((snapshot) => {
        let userFoodsNames = []
        foodlist_count = snapshot.val()
        console.log('foodlist_count: ' + foodlist_count)
        if (snapshot.exists()){
            for(let i = 0; i < foodlist_count; i++){
                let food_name_data = fb.database().ref('Delivery/'+ userDelCat + '/' + userPoint + '/' + user_mode + '/categories/' + userCategory + '/food/' + i)
                food_name_data.get().then((snapshot) => {
                    if (snapshot.val().is_active !== undefined && snapshot.val().is_active === true){
                        userFoodsNames[i] = '🔘 ' + snapshot.val().name
                        userFoodlist[i] = 'admnturnoff_' + i
                    }

                    if (snapshot.val().is_active !== undefined && snapshot.val().is_active === false){
                        userFoodsNames[i] = '⚪️ ' + snapshot.val().name
                        userFoodlist[i] = 'admnturnon_' + i
                    }

                    if (snapshot.val().is_active === undefined){
                        userFoodsNames[i] = '❗️' + snapshot.val().name
                        userFoodlist[i] = 'admnerr_' + i
                    }
                    
                    console.log('food #' + i + ' = ' + userFoodlist[i])
                    if (i === foodlist_count-1){
                        foodlist_keyboard = []
                        let minuser = 0
                        console.log('food last = #' + i + ' = ' + userFoodlist[i])
                        // foodlist_count++
                        foodlist_keyboard[0] = [{
                            text: '◀️ Назад',
                            callback_data: admin_menu_buttons[2][1] + '_sec'
                        }]
                        for (let i = 1; i < foodlist_count + 1; i=i+2){
                            console.log('catr: ' + i)
                            if (i === foodlist_count){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userFoodlist[i-1])
                                foodlist_keyboard[i-minuser] = [{
                                    text: userFoodsNames[i-1],
                                    callback_data: userFoodlist[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === foodlist_count){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat.id, choosefood_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:foodlist_keyboard
                                        }
                                    }).then(res => {
                                        message_toedit[7] = res.message_id
                                        message_text[7] = res.text
                                    })
                                }
                            }
                            else if (keyboard_buttons === foodlist_count){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat.id, choosefood_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup:{
                                            inline_keyboard:foodlist_keyboard
                                    }
                                }).then(res => {
                                    message_toedit[7] = res.message_id
                                    message_text[7] = res.text
                                })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userFoodlist[i-1] + '. Вторая кнопка: ' + userFoodlist[i])
                                foodlist_keyboard[i - minuser] = [{
                                    text: userFoodsNames[i-1],
                                    callback_data: userFoodlist[i-1]
                                },
                                    {
                                        text: userFoodsNames[i],
                                        callback_data: userFoodlist[i]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === foodlist_count){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat.id, choosefood_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:foodlist_keyboard
                                        }
                                    }).then(res => {
                                        message_toedit[7] = res.message_id
                                        message_text[7] = res.text
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

const admin_menu_buttons = [['⚙️ Настройки', 'admeditbot_query'], ['📧 Рассылка', 'admeiling_cb'], ['🚫 Стоп-лист', 'mtms_cb'], ['🎟 Промокоды', 'pmcds_cb'], ['👨‍💻 Нужна помощь?', 'admgtcntcts_cb']]
const admin_menu_keyboard = [
    [{
        text: admin_menu_buttons[0][0],
        callback_data: admin_menu_buttons[0][1]
    },
    {
        text: admin_menu_buttons[1][0],
        callback_data: admin_menu_buttons[1][1]
    }],
    [{
        text: admin_menu_buttons[2][0],
        callback_data: admin_menu_buttons[2][1]
    },
    {
        text: admin_menu_buttons[3][0],
        callback_data: admin_menu_buttons[3][1]
    }],
    [{
        text: admin_menu_buttons[4][0],
        callback_data: admin_menu_buttons[4][1]
    }]
]

const admin_preferences_buttons = [['📦 Доставка','admndlvrst_cb'], ['🕓 Время работы','admtme_cb'], ['☎️ Контакты','admvrnk_cb'], ['◀️ Назад','admprfsbck_cb'], ['➕ Новый купон','crtncpn_cb']]
const admin_preferences_keyboard = [
    [{
        text: admin_preferences_buttons[3][0],
        callback_data: admin_preferences_buttons[3][1]
    },
    {
        text: admin_preferences_buttons[1][0],
        callback_data: admin_preferences_buttons[1][1]
    }],
    [{
        text: admin_preferences_buttons[0][0],
        callback_data: admin_preferences_buttons[0][1]
    },
    {
        text: admin_preferences_buttons[2][0],
        callback_data: admin_preferences_buttons[2][1]
    }]
]

module.exports = {
    CategoriesKeyboard,
    FoodKeyboard,
    CitiesKeyboard,
    PointsKeyboard,
    DeliveryCatKeyboard,
    CategoriesKeyboardAdmin,
    FoodKeyboardAdmin,
    admin_menu_keyboard,
    admin_menu_buttons,
    admin_preferences_buttons,
    admin_preferences_keyboard
}