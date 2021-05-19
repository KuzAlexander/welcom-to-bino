jQuery(document).ready(function(){
    //скролл меню
    $('.js__menu').on('click', function(event){
        event.preventDefault
        let currentBlock = $(event.target).attr('href')
        let distanceBlock = $(currentBlock).offset().top     
        $('html, body').animate({
            scrollTop: distanceBlock
        }, 500)
    })

    //скролл иконки
    $('.header__icon a').click(function(){
        let offsetBlock = $('.advantages').offset().top
        $('html, body').animate({
            scrollTop: offsetBlock + 30
        }, 500)
    })

    // скролл стрелки
    $('.arrow a').click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 500)
    })
})
