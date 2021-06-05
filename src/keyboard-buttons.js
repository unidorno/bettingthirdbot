
//создаем клавиатуру с категориями
function CategoriesKeyboard(category_keyboard, userCategories, categories_count, fb, bot, chat, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text){
    let keyboard_buttons = 0
    //category_keyboard = []
    //userCategories = []
    //categories_count = 0
    let categories_data = fb.database().ref('Delivery/ordering/categories/categories_number')
    categories_data.get().then((snapshot) => {
        categories_count = snapshot.val()
        console.log('categories_count: ' + categories_count)
        if (snapshot.exists()){
            for(let i = 0; i < categories_count; i++){
                let category_name_data = fb.database().ref('Delivery/ordering/categories/' + i + '/category_name')
                category_name_data.get().then((snapshot) => {
                    userCategories[i] = snapshot.val()
                    console.log('category #' + i + ' = ' + userCategories[i])
                    if (i === categories_count-1){
                        let minuser = 0
                        console.log('category last = #' + i + ' = ' + userCategories[i])
                        // categories_count++
                        /*category_keyboard[0] = [{
                            text: anotherpoint_text,
                            callback_data: anotherpoint_text
                        }]*/
                        for (let i = 0; i < categories_count; i=i+2){
                            console.log('catr: ' + i)
                            if (i === categories_count){
                                console.log('Ряд #: ' + (i-minuser) + ' (1 кнопка ПОСЛЕДНЯЯ): ' + userCategories[i-1])
                                category_keyboard[i-minuser] = [{
                                    text: userCategories[i-1],
                                    callback_data: userCategories[i-1]
                                }]
                                keyboard_buttons++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === categories_count){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, hellomessage_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: 
                                            [[
                                                {
                                                    text: location_text
                                                }
                                            ],[
                                                {
                                                    text: phone_text
                                                }
                                            ]],
                                                resize_keyboard: true
                                            }
                                    }).then(() => {
                                        bot.sendMessage(chat, choosecategory_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:category_keyboard
                                                }
                                            })
                                    })
                                    

                                }
                            }
                            else if (keyboard_buttons === categories_count){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.sendMessage(chat, hellomessage_text,
                                    {
                                        parse_mode: 'HTML',
                                        reply_markup: {
                                            keyboard: 
                                            [[
                                                {
                                                    text: location_text
                                                }
                                            ],[
                                                {
                                                    text: phone_text
                                                }
                                            ]],
                                                resize_keyboard: true
                                            }
                                    }).then(() => {
                                        bot.sendMessage(chat, choosecategory_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                inline_keyboard:category_keyboard
                                                }
                                            })
                                    })
                            }
                            else {
                                console.log('Ряд #: ' + (i-minuser) + ' (2 кнопки). Первая кнопка: ' + userCategories[i] + '. Вторая кнопка: ' + userCategories[i+1])
                                category_keyboard[i - minuser] = [{
                                    text: userCategories[i],
                                    callback_data: userCategories[i]
                                },
                                    {
                                        text: userCategories[i+1],
                                        callback_data: userCategories[i+1]
                                    }]
                                keyboard_buttons = keyboard_buttons + 2
                                minuser++
                                console.log('keyboard_buttons: ' + keyboard_buttons)
                                if (keyboard_buttons === categories_count){
                                    console.log('last element of categories has be written, so lets send this keyboard')
                                    bot.sendMessage(chat, hellomessage_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup: {
                                                keyboard: 
                                                [[
                                                    {
                                                        text: location_text
                                                    }
                                                ],[
                                                    {
                                                        text: phone_text
                                                    }
                                                ]],
                                                    resize_keyboard: true
                                                }
                                        }).then(() => {
                                            bot.sendMessage(chat, choosecategory_text,
                                                {
                                                    parse_mode: 'HTML',
                                                    reply_markup:{
                                                        inline_keyboard:category_keyboard
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

function FoodKeyboard(foodlist_keyboard, userFoodlist, foodlist_count, userCategory, fb, bot, chat, message_id, anothercategory_text, query, choosefood_text){
    let keyboard_buttons = 0
    let categories_data = fb.database().ref('Delivery/ordering/categories/' + userCategory + '/food/food_number')
    categories_data.get().then((snapshot) => {
        foodlist_count = snapshot.val()
        console.log('foodlist_count: ' + foodlist_count)
        if (snapshot.exists()){
            for(let i = 0; i < foodlist_count; i++){
                let food_name_data = fb.database().ref('Delivery/ordering/categories/' + userCategory + '/food/' + i + '/name')
                food_name_data.get().then((snapshot) => {
                    userFoodlist[i] = snapshot.val()
                    console.log('food #' + i + ' = ' + userFoodlist[i])
                    if (i === foodlist_count-1){
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
                                    bot.deleteMessage(query.message.chat.id, query.message.message_id)
                                        .then(bot.sendMessage(chat.id, choosefood_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:foodlist_keyboard
                                            }
                                        }))

                                }
                            }
                            else if (keyboard_buttons === foodlist_count){
                                console.log('last element of categories has be written, so lets send this keyboard')
                                bot.deleteMessage(query.message.chat.id, query.message.message_id)
                                    .then(bot.sendMessage(chat.id, choosefood_text,
                                        {
                                            parse_mode: 'HTML',
                                            reply_markup:{
                                                inline_keyboard:foodlist_keyboard
                                            }
                                        }))
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
                                    bot.deleteMessage(query.message.chat.id, query.message.message_id)
                                        .then(bot.sendMessage(chat.id, choosefood_text,
                                            {
                                                parse_mode: 'HTML',
                                                reply_markup:{
                                                    inline_keyboard:foodlist_keyboard
                                                }
                                            }))
                                }
                            }
                        }
                    }
                })
            }
        }
    })
}

module.exports = {
    CategoriesKeyboard,
    FoodKeyboard
}