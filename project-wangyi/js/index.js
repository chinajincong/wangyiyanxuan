//公用方法调用：
yx.public.navFn();
yx.public.lazyImgFn();
yx.public.backUpFn();


//banner轮播图组件实例
var bannerPic=new Carousel();

bannerPic.init({
    id:'bannerPic',
    autoplay:true,
    intervalTime:3000,
    loop:true,
    totalNum:5,
    moveNum:1,
    circle:true,
    moveWay:'opacity'
})

//新品首发组件实例
var newProduct=new Carousel();

newProduct.init({
    id:'newProduct',
    autoplay:false,
    intervalTime:1000,
    loop:false,
    totalNum:8,
    moveNum:2,
    circle:false,
    moveWay:'position'
})

newProduct.on('leftEnd',function(){
    //alert('左边到头了');
    this.prevBtn.setAttribute("style","background-color: #E7E2D7 !important");
});
newProduct.on('rightEnd',function(){
    //alert('右边到头了');
    this.nextBtn.setAttribute("style","background-color: #E7E2D7 !important");
});
newProduct.on('leftClick',function(){
    this.nextBtn.style.backgroundColor='#D0C4AF';
});
newProduct.on('rightClick',function(){
    this.prevBtn.style.backgroundColor='#D0C4AF';
});

//人气推荐选项卡
(function(){
    var titles=yx.ga('#recommend header li');
    var contents=yx.ga('#recommend .content');

    for(var i=0;i<titles.length;i++){
        titles[i].index=i;
        titles[i].onclick=function(){
            for(var i=0;i<contents.length;i++){
                titles[i].className='';
                contents[i].style.display='none';
            }
            this.className='active';
            contents[this.index].style.display='block';
        }
    }
})();

//限时购
(function(){
    var timeBox=yx.g('#limit .time');
    var spans=yx.ga('#limit .time span');
    var timer=setInterval(showTime,1000);

    //倒计时功能函数
    showTime();
    function showTime(){
        var endTime=new Date(2018,4,30);

        //如果当前的时间没有超过截止的时间，才去做倒计时；
        if(new Date()<endTime){
            var overTimeObj=yx.cutTime(endTime);
            spans[0].innerHTML=yx.format(overTimeObj.h);
            spans[1].innerHTML=yx.format(overTimeObj.m);
            spans[2].innerHTML=yx.format(overTimeObj.s);
        }else{
            clearInterval(timer);
        }
    };

    //商品数据
    var boxWrap=yx.g('#limit .boxWrap');
    var str='';
    var item=limitDetails.itemList;

    for(var i=0;i<item.length;i++){
        str+=`
            <div class="limitBox">
                <a href="#" class="scaleImg left"><img class="original" src="images/empty.gif" data-original="${item[i].primaryPicUrl}" alt="" /></a>
                <div class="right">
                    <a href="#" class="title">${item[i].itemName}</a>
                    <p>${item[i].simpleDesc}</p>
                    <div class="numBar clearfix">
                        <div class="numCon">
                            <span style="width:${item[i].currentSellVolume/item[i].totalSellVolume*100+'%'}"></span>
                        </div>
                        <span class="numTips">${'还剩'+item[i].currentSellVolume+'件'}</span>
                    </div>
                    <div>
                        <span class="xianshi">限时价</span><span class="fuhao">￥</span><strong>${item[i].actualPrice}</strong><span class="yuan">${'原件￥'+item[i].retailPrice}</span>
                    </div>
                    <a href="#" class="qianggou">立即抢购</a>
                </div>
            </div>
        `;
    };
    boxWrap.innerHTML=str;
})();


//大家都在说
var	sayPic=new Carousel();
sayPic.init({
    id:'sayPic',
    autoplay:true,
    intervalTime:3000,
    loop:true,
    totalNum:9,
    moveNum:1,
    circle:false,
    moveWay:'position'
});




