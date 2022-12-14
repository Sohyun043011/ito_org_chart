var org={

    '관광마케팅실':['의료웰니스팀'],
    '관광산업실':['축제이벤트팀','섬발전지원센터','관광인프라팀','관광기업지원센터'],
    '기타 부서':['안전감사팀','비서실']
}
var dept_info={'의료웰니스팀':2,'축제이벤트팀':3,'섬발전지원센터':2,'관광인프라팀':2,'관광기업지원센터':4,'안전감사팀':2,'비서실':1};
var office = ['관광마케팅실','관광산업실','기타 부서'];

$(document).ready(function(){
            $('#container').css({"width": window.innerWidth, "height":'100%'});     //전체 컨테이너 크기 지정
            $('.cell').removeClass('border bg-light');                              //셀 안에 배경 색 제거 
            $('.mem-img').addClass('border');                                       //각 이미지에 선 추가
            $('.dept-table').last().css({'border-right':'none'});                   //마지막 팀 테두리 선 제거 
            
            // 1. 각 실의 열수에 비례한 width 조정 - 16F/create.js 와 동일
            // 실장실에 순서대로 클래스명 부착
            for(var off = 0; off<office.length; off++){
                $('.header').eq(off).addClass(`header-${off}`);
            }

            // 전체 열 수 
            var sum=0;
            Object.values(dept_info).forEach(function(element){
                sum=sum+element;
            });

            //열수를 이용해서 각 팀의 width 조정
            for(var i=0;i<Object.keys(dept_info).length;i++){
                $('.department').eq(i).css({'width':`${(100*(Object.values(dept_info)[i]))/sum}%`});
            }

             // 각 실의 부서들에 실 id (office-0, office-1..부착)
            for(var j = 0;j<Object.keys(dept_info).length;j++){
                var dept_name = $('.dept-name').eq(j).text();
                for(var k=0;k<Object.keys(org).length;k++){
                    var width_sum = 0;
                    var dept = Object.values(org)[k];
                    for(var t=0;t<dept.length;t++){
                        if(dept_name==dept[t]){
                            $('.department').eq(j).addClass(`office-${k}`);
                            width_sum=width_sum+$('.department').eq(j).width();
                        }
                    }
                } 
            }

            // 각 실에 해당하는 부서의 width를 더해서 실의 width로 바꾸기
            for(var h=0;h<$('.header').length;h++){
                var width_sum=0;
                for(var t=0;t<$(`.office-${h}`).length;t++){
                    width_sum=width_sum+$(`.office-${h}`).eq(t).width();
                }
                $('.header').eq(h).css({'width':`${width_sum}`});
            }

            
            // 2. 17층에 비서실 추가함
            // 비서실의 경우,팀장이 없으므로, 팀장자리에(.row) secretary 클래스 부착
            $('.office-head').eq(0).css({'display':'none'});                //관광마케팅실 크기가 작아서 실장님 이름 안보이게 설정함.
            $('.row').last().addClass('secretary');

            // 3. 각 사원의 status(근무상태)를 설정 - 16F/create.js와 동일
            $.ajax({
                method:'POST',
                url:'/status',
                data:{},
                success:function(result){                       //result : 서버에서 전달해준 json 값 
                    for(var mem=0;mem<$('.memInfo').length;mem++){
                        if($('.memInfo').eq(mem).children().length>0)
                        {
                            //$('.memInfo').eq(mem).children()>0 : 이름,직급 나와있는 cell인 경우(빈 셀 아닌 경우
                            //$('.memInfo').eq(mem).children('span:eq(0)') : 이름 span 태그의 id 즉 해당 셀의 사번을 가져옴
                            var id = $('.memInfo').eq(mem).children('span:eq(0)').attr('id')
                            for(var res=0; res<result.length;res++)
                            {
                                if(id==result[res]['emp_id'])
                                {
                                    var status = result[res]['status'];             //해당 사원의 근무상태
                                    if(status=="재택근무")
                                    {
                                        //재택근무면 파란색(btn-primary)
                                        $('.cell').eq(mem).children('span:eq(0)').removeClass('btn-green');
                                        $('.cell').eq(mem).children('span:eq(0)').addClass('btn-blue');
                                        
                                    }
                                    else if(status=="출장 및 교육")
                                    {
                                        //근무 중은 초록색(기본 btn-success)
                                        $('.cell').eq(mem).children('span:eq(0)').removeClass('btn-green');
                                        $('.cell').eq(mem).children('span:eq(0)').addClass('btn-yellow');
                                    }
                                    else if(status=="휴무")
                                    {
                                        //연차일땐 
                                        $('.cell').eq(mem).children('span:eq(0)').removeClass('btn-green');
                                        $('.cell').eq(mem).children('span:eq(0)').addClass('btn-red');
                                    
                                    }
                                }
                            }
                        }
                        else{
                            //(빈 셀인 경우) 상태표시 제거
                            $(".rounded-circle").eq(mem+4).css({'display':'none'});
                        }
                    }
                }
            });

            // 4. 각 실장님 클릭시 detail 모달창 (다른 사원과 내부 요소들이 달라서 따로 구현함) - 16F/create.js와 동일
            $('.header').on('click',function(e){
                
                var data = e.currentTarget.children[1].getAttribute('id');
                //띄울 mem의 id
                
                if(data)
                {
                    $('.black-background').css({marginTop:'0px'});
                    $('.black-background').show();
                    $('.right-container').scrollTop(0);
                    $.ajax({
                        method:'POST',
                        url:'/detail',
                        data:{
                            id:data
                        },  //서버로 보낼 데이터
                        success:function(result){
                            var name = result[0].emp_name;
                            var office = result[0].dept_name;
                            var mobile = result[0].mobile_no;
                            var office_no = result[0]. office_tel_no;
                            var position_tag = result[0].duty_name;
                            var detail_tag = result[0].roll_info;
                            var img = result[0].img_url;
                            
                            // background.ejs에 받은 정보들 삽입
                            document.getElementById('img').innerHTML= `<img src="${img}" id="pic">`
                            document.getElementById('name_tag').innerHTML = `${name} ${position_tag}`;
                            document.getElementById('office_tag').innerHTML=office;
                            document.getElementById('phone_tag').innerHTML = mobile;
                            document.getElementById('office_p_tag').innerHTML = office_no;
                            document.getElementById('detail_tag').innerHTML = detail_tag;
                        },
                        error: function(result){
                           console.log(result);
                        }
                    })

                }
            });
            //5. 사원 이미지 클릭시 detail 모달창 띄움 - 16F/create.js와 동일
            $('.mem-img').on('click',function(e){
                $('.black-background').css({marginTop:'0px'});
                $('.black-background').show();
                $('.right-container').scrollTop(0);     //스크롤 위치 위로 초기화
                var data =  e.target.parentElement.parentElement.children[1].children[0].getAttribute('id');
                //띄울 mem의 id
                $.ajax({
                    method:'POST',
                    url:'/detail',
                    data:{
                        id:data
                    },  //서버로 보낼 데이터
                    success:function(result){
                        var name = result[0].emp_name;
                        var office = result[0].dept_name;
                        var mobile = result[0].mobile_no;
                        var office_no = result[0]. office_tel_no;
                        var detail_tag = result[0].roll_info;
                        var img = result[0].img_url;
                        
                        // 팀장은 duty_name, 나머지 사원은 post_name이 직급
                        if(result[0].duty_name=="팀장"){
                            var position_tag = result[0].duty_name; 
                        }
                        else{
                            var position_tag = result[0].post_name; 
                        }

                        // background.ejs에 받은 정보들 삽입
                        document.getElementById('img').innerHTML= `<img src="${img}" id="pic">`
                        document.getElementById('name_tag').innerHTML = `${name} ${position_tag}`;
                        document.getElementById('office_tag').innerHTML=office;
                        document.getElementById('phone_tag').innerHTML = mobile;
                        document.getElementById('office_p_tag').innerHTML = office_no;
                        document.getElementById('detail_tag').innerHTML = detail_tag;
                    },
                    error: function(result){
                        console.log(result);
                    }
                })

            });

            // 6. 모달창 뒤 검은 배경 누르면 창 닫힘 - 16F/create.js와 동일
            $('.black-background').click(function(e){
                    if(e.target==e.currentTarget){
                      $('.black-background').hide();
                    }
            });

            // 7. X 버튼 누르면 창 닫힘 - 16F/create.js와 동일
            $('.btn-close').click(function(e){
                    //close button 눌렀을 때도 닫기 
                    if(e.target==e.currentTarget){
                        $('.black-background').hide();
                    }
            });

    }  
);

// 8. 수정버튼 누를시 login - 16F/create.js와 동일
const login = async()=>{
    const { value: password } = await Swal.fire({
        title: '비밀번호를 입력하세요',
        icon:'warning',
        input: 'password',
        heightAuto:false,
        inputPlaceholder: '비밀번호를 입력하세요',
        inputAttributes: {
          maxlength: 10,
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        inputValidator: (value) => {
            if (!value) {
              return '비밀번호를 입력해주세요!'
            }
          }
      });
      
      var link=document.location.href;
      if (password) {
        var link=document.location.href;
        $.ajax({
            method:'POST',
            url:'/login',
            data : {
                password:password,
                url:link
            },
            success:function(result){
                if(result.error){
                    // error일 때
                    if(result.error=="Password is not correct."){
                        Swal.fire({
                            title : "비밀번호가 틀렸습니다.",
                            icon:'warning',
                            heightAuto : false,
                        }).then(()=>{
                            location.href='/';
                        })
                    }
                    else if(result.error=="Already another user logged in."){
                        Swal.fire({
                            title : "다른 유저가 접속중입니다.",
                            icon:'warning',
                            heightAuto : false,
                        }).then(()=>{
                            location.href='/';
                        })
                    }
                    

                }else{
                    window.location.replace(result.url);
                }
                
            },
            error:function(result){
                console.log(result);
            }
        })
      }
}

// 9. 3600초마다 reload(8~18시 사이인 경우) - - 16F/create.js와 동일
setInterval(function(){ //3600초마다 function() 실행 
    today = new Date();
    if(today.getHours()>=8 && today.getHours()<18)
    {
        // 8시~18시 사이면 refresh
        location.reload();
    }
    else{
        return;
    }
}, 3600000);