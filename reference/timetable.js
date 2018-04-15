/***************************************************************************************************
 * Author        	:carollai
 * Create date    :
 * description    :
 * called by    	:course/Course_Timetable/index.asp
  * ----------------------------------------------------------------------------------------------
 * Modify Record	:（--編號--更改日期--更改人--更改方式(add,modify,del)--更改說明--）
 * --No.00001--2012.05.15--carollai--add--create timeable.js--
 * --No.00002--2011.05.16--carollai--add--create get_acysem function--
 * --No.00003--2012.05.16--carollai--add--create get_timetable_menu_html function--  
 * --No.00004--2012.05.16--carollai--add--create add_icon_button_click function--   
 * --No.00005--2012.05.16--carollai--add--create change_flang function--    
 * --No.00006--2012.05.16--carollai--add--create window.onbeforeunload function--   
 * --No.00007--2012.05.17--carollai--add--add build_Category_Option function--    
 * --No.00008--2012.05.17--carollai--add--add change_fCategory function--     
 * --No.00009--2012.05.17--carollai--add--add get_fCollege function--
 * --No.00010--2012.05.17--carollai--add--add build_College_Option function--   
 * --No.00011--2012.07.23--carollai--add--add check_click_chkAcySem_checkbox function--    
 * --No.00012--2012.07.23--carollai--add--add check_click_chkDep_checkbox function--    
 * --No.00013--2012.07.23--carollai--add--add check_click_chkOption_checkbox function--    
 * --No.00014--2012.07.23--carollai--add--add get_timetable_main_table_html function--     
 * --No.00015--2012.07.24--carollai--add--add load_default_function function--    
 * --No.00016--2012.07.25--carollai--add--add chkOption_show_hide function--     
 * --No.00017--2012.07.25--carollai--add--add build_timetable_main_table_content function--      
 * --No.00018--2012.07.26--carollai--add--add click_foption_tr_text function--   
 * --No.00019--2012.09.03--carollai--add--mantis#4603:新版課程時間表舊學期可呈現「修課人數」；當學期之「修課人數」只有在非選課期間才呈現，選課期間隱藏。--
 * --No.00020--2012.12.27--carollai--modify--mantis#4807:新版課程時間表-橋接課程查詢後呈現錯誤的課程列表。-- 
 * --No.00021--2013.05.23--carollai--modify--mantis#7064:搜尋<橋接課程>後再搜尋<特殊條件>會有問題。--  
 * --No.00022--2013.06.13--carollai--modify--mantis#6975:將「ICP(資訊工程學系)」及「IIE(生醫工程研究所)」排在最後，使用反向插入的方式。
 * --No.00023--2013.06.18--carollai--modify--mantis#6975:不使用反向插入方式，改成「ICP(資訊工程學系)」及「IIE(生醫工程研究所)」最後在新增的方式。 
 * --No.00024--2013.09.11--carollai--modify--mantis#8232:課程時間表(若點選特殊條件~請自動不要預設選取開課系所)。  
 ***************************************************************************************************/
var Timetable_Menu_Html = new Object; //存放Timetable Menu html
var Acy_Sem;
var Lang_Type;  //zh-tw:中文;en-us:英文
var FType; //項目選項
var Timetable_Choose_Time_Html;
var Timetable_Main_Table_Html = new Object;
var English_Semester = {'1':'&nbsp;Fall Semester','2':'&nbsp;Spring Semester','X':'&nbsp;Summer Vacation Semester'};
var Chinese_Semester = {'1':'上','2':'下','X':'暑'};
var Cos_Data_List;
var Chk_Acysem;
var Chk_Dep;
var Chk_Option;
var Time_Code;
var Classroom_Code;
var Time_Classroom_Code_Html = new Object;
var Html_Content = []; //紀錄取得的HTML頁面內容

//var Select_Option_Data = {};
//Select_Option_Data['zh-tw'] = {};
//Select_Option_Data['en-us'] = {};

Lang_Type = 'zh-tw'; //預設語言為中文
 
$(document).ready(function() {
    //tabs(1)
    if($('#timetable_container').length > 0){
        //有default語言則不需要判斷瀏覽器
        get_default_lang();
//        load_default_function();
//        build_time_classroom_code_table();
        
    }
});

/*  description: 載入預設語言
 *  create date: 2014.08.04
 *  called by:	$(document).ready
                 
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_default_lang(){
    var defaultlang;
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_default_lang",
        dataType: "json",
        data:{},
        success: function(json) {
            defaultlang=json['defaultlang'];
            delete json;
            //無default langulage
            if(defaultlang.length==0){
                //判斷瀏覽器語言
                var language = window.navigator.language;
                if(!language){
                 language = window.navigator.browserLanguage;
                }
                language = language.toLowerCase();
                chk_lang = language.indexOf('tw');
                if ( chk_lang > -1) {
                    defaultlang = 'zh-tw';
                }
                else {
                    defaultlang = 'en-us';
                }
            }
            Lang_Type = defaultlang;
            get_view_html_content('timetable_menu',defaultlang);
        }             
    });
    
    defaultlang = null;
}

/*  description: 載入預設使用的function
 *  create date: 2012.07.24
 *  called by:	$(document).ready
                 
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function load_default_function(){
        //學年度學期別預設為選取狀態
        $('#chkAcySem').prop("checked", true);
        //開課系所預設為選取狀態
        $('#chkDep').prop("checked", true);

        $('#timetable_main').html('');
        
        
        get_time_classroom_code();
        get_acysem();
        change_flang();
        change_ftype();
        change_fCategory();	
        change_fCollege();	
        change_fDep();
        change_fGroup();
        change_fGrade(); 

        var theType = $("input[name='theType']").val();
        if(theType && theType.length>0){
            $('#fType').val(theType);
            $("input[name='theType']").val('');
        }
        $('#fType').trigger('change');
        
        click_choose_time_button();
        check_click_chkAcySem_checkbox();
        check_click_chkDep_checkbox();
        check_click_chkOption_checkbox();	
        click_foption_tr_text();
        
        click_Search_button();
} 


/*  description: 載入課程時間表選單html檔案
 *  create date: 2012.05.16
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_timetable_menu_html(m_flang){
    if(typeof m_flang=='undefined') m_flang=Lang_Type;
    
    $('#chcourse_web').find('div').find('a').remove();
    if(m_flang=="zh-tw") {
        $('#timetable_container span.title').html("國立交通大學 課程時間表");
        $('#chcourse_web').find('div').append('<a  href="https://course.nctu.edu.tw/" target="_blank">&nbsp;&nbsp;學&nbsp;生&nbsp;選&nbsp;課&nbsp;系&nbsp;統&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a  href="https://course.nctu.edu.tw/Description/index.asp" target="_blank">&nbsp;&nbsp;選&nbsp;&nbsp;課&nbsp;&nbsp;使&nbsp;&nbsp;用&nbsp;&nbsp;說&nbsp;&nbsp;明&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a  href="https://course.nctu.edu.tw/Course/course_report/course_report.asp" target="_blank">&nbsp;&nbsp;英&nbsp;&nbsp;文&nbsp;&nbsp;授&nbsp;&nbsp;課&nbsp;&nbsp;報&nbsp;&nbsp;表&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a  href="https://course.nctu.edu.tw/Course/ProgramsMap/index.asp" target="_blank">&nbsp;&nbsp;學&nbsp;&nbsp;程&nbsp;&nbsp;地&nbsp;&nbsp;圖&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a  href="http://aadm.nctu.edu.tw/chcourse/" target="_blank">&nbsp;&nbsp;課&nbsp;務&nbsp;組&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a  href="http://gec2017.nctu.edu.tw/?p=417" target="_blank">&nbsp;&nbsp;通&nbsp;識&nbsp;新&nbsp;制&nbsp;選&nbsp;課&nbsp;規&nbsp;則&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a  href="http://www.nctu.edu.tw/" target="_blank">&nbsp;&nbsp;交&nbsp;通&nbsp;大&nbsp;學&nbsp;&nbsp;</a>');
        document.title="國立交通大學 課程時間表";
    }
    else {
        $('#timetable_container span.title').html("National Chiao Tung University Course Timetable");
        $('#chcourse_web').find('div').append('<a href="https://course.nctu.edu.tw/en/" target="_blank">Online Course Registration System</a>');
        $('#chcourse_web').find('div').append('<a  href="https://course.nctu.edu.tw/Description/index.asp" target="_blank">Course Registration Instructions</a>');
        $('#chcourse_web').find('div').append('<a href="http://aadm.nctu.edu.tw/chcourse/" target="_blank">Office of Academic Affairs</a>');
//        20170608雅坪提英文先不上，因為沒有英文翻譯
//        $('#chcourse_web').find('div').append('<a href="http://gec2017.nctu.edu.tw/?p=417" target="_blank">&nbsp;&nbsp;通&nbsp;識&nbsp;新&nbsp;制&nbsp;選&nbsp;課&nbsp;規&nbsp;則&nbsp;&nbsp;</a>');
        $('#chcourse_web').find('div').append('<a href="http://www.nctu.edu.tw/en" target="_blank">National Chiao Tung University</a>');
        document.title="National Chiao Tung University Course Timetable";
    }
    $('#timetable_menu').html(Timetable_Menu_Html[m_flang]);
        
    $('.foption td').hide();
    add_icon_button_click();
    
}

/*  description: 點選特定條件顯示或隱藏圖示
 *  create date: 2012.05.16
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function add_icon_button_click(){
	
    $('#timetable_container .add_icon_button').bind("click",function(){
        if($(this).attr('src')=="public/images/icon_add.png"){
            chkOption_show_hide(true);
        }
        else{
            chkOption_show_hide(false);
        }
    });
	
}

/*  description: 顯示或隱藏特定條件
 *  create date: 2012.07.25
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
 function chkOption_show_hide(isShow){
     	if(isShow){
            $('#timetable_container .add_icon_button').attr('src','public/images/icon_minus.png');
            $('#timetable_container .add_icon_button').attr('alt','hide');
            $('#timetable_container .add_icon_button').attr('title','hide');
            $('.foption td').show();    	         	
     	}
     	else{
            $('#timetable_container .add_icon_button').attr('src','public/images/icon_add.png');
            $('#timetable_container .add_icon_button').attr('alt','show');
            $('#timetable_container .add_icon_button').attr('title','show');
            $('.foption td').hide();         
     	}
 }


/*  description: 取得學年度學期別資料，並產生學年度選單資料
 *  create date: 2011.12.02
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_acysem(){
    if(typeof Acy_Sem=='undefined'){
        $.ajax({
            type: "POST",
            url: modulePath + "?r=main/get_acysem",
            dataType: "json",
            data:{},
            success: function(json) {
                Acy_Sem=json;
                delete json;
                
                $('#fAcySem').children().remove();
                $.each(Acy_Sem,function(idx,item){
                    m_str = item['T'];
                    
                    if(Lang_Type=='zh-tw') {
                        if (m_str.substr(m_str.length-1,1) === 'X'){
                            html='<option value="'+m_str+'">'+m_str.substr(0,m_str.length-1)+' 學年度 暑期'+'</option>';
                        }else{
                            html='<option value="'+m_str+'">'+m_str.substr(0,m_str.length-1)+' 學年度 第 '+m_str.substr(m_str.length-1,1)+' 學期'+'</option>';
                        }
                    }else{
                        html='<option value="'+m_str+'">';
                        html=html+m_str.substr(0,m_str.length-1);
                        if (m_str.substr(m_str.length-1,1) === 'X'){
                            html=html+'&nbsp;Summer Semester';
                        }else{
                            if(m_str.substr(m_str.length-1,1)==1){
                                html=html+'&nbsp;Fall Semester';
                            }
                            else{
                                html=html+'&nbsp;Spring Semester';
                            }
                        }
                        html=html+'</option>';
                        
                    }
                    $('#fAcySem').append(html);
                    delete item;
                    delete html;
                });

                delete idx;
                change_fAcySem();
            }             
        });
    }
    else {
        $('#fAcySem').children().remove();
        $.each(Acy_Sem,function(idx,item){
            m_str = item['T'];
            if(Lang_Type=='zh-tw') {
                if (m_str.substr(m_str.length-1,1) === 'X'){
                    html='<option value="'+m_str+'">'+m_str.substr(0,m_str.length-1)+' 學年度 暑期'+'</option>';
                }else{
                    html='<option value="'+m_str+'">'+m_str.substr(0,m_str.length-1)+' 學年度 第 '+m_str.substr(m_str.length-1,1)+' 學期'+'</option>';
                }
            }else{
                html='<option value="'+m_str+'">';
                html=html+m_str.substr(0,m_str.length-1);
                if (m_str.substr(m_str.length-1,1) === 'X'){
                    html=html+'&nbsp;Summer Semester';
                }else{
                    if(m_str.substr(m_str.length-1,1)==1){
                        html=html+'&nbsp;Fall Semester';
                    }
                    else{
                        html=html+'&nbsp;Spring Semester';
                    }
                }
                html=html+'</option>';

            }
            $('#fAcySem').append(html);
            delete item;
            delete html;
        });

        delete idx;
        change_fAcySem();
    }

}

/*  description: 選取學年度學期別選單動作(change)
 *  create date: 2012.05.18
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_fAcySem(){
    $('#fAcySem').bind('change',function(){
        $('#fType').trigger('change');
    });
}



/*  description: 選取項目選單動作(change)
 *  create date: 2011.12.02
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_ftype(){
    $('#fType').bind('change',function(){
        FType = $('#fType').val();
        $("#qtype").val(FType);
        get_fCategory();
    });
}

/*  description: 取得系所類別列表
 *  create date: 2010.05.17
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_fCategory(){
    m_ftype = $('#fType').val();
    m_acysem = $('#fAcySem').val();
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_category",
        dataType: "json",
        data:{ftype:m_ftype,flang:Lang_Type,acysem:m_acysem},
        success: function(json) {
            $data = json;
            delete json;

            //根據選擇的類別，更改需要呈現的選單--start--
            //$('#fType').show();
            $('#fCategory').show();
            $('#fCollege').show();
            $('#fDep').show();
            $('#fGroup').show();
            $('#fGrade').show();
            $('#fClass').show();

            switch(m_ftype){
                case '3':
                case '2':
                    build_Category_Option($data,m_ftype);
                    break;
                case '0':
                    build_Category_Option($data,m_ftype);
                    $('#fCollege').hide();
                    $('#fGroup').hide();
                    $('#fGrade').hide();
                    $('#fClass').hide();
                    break;
                case '8':
                    $('#fCategory').hide();
                    $('#fCollege').hide();
                    $('#fDep').hide();
                    $('#fGroup').hide();
                    $('#fGrade').hide();
                    $('#fClass').hide();
                    break;
                case '9':
                    $('#fCategory').hide();
                    $('#fCollege').hide();
                    $('#fGroup').hide();
                    $('#fGrade').hide();
                    $('#fClass').hide();
                    break;
                default:
                    $('#fCategory').hide();
                    $('#fCollege').hide();
                    $('#fGroup').hide();
                    $('#fGrade').hide();
                    $('#fClass').hide();
                    break;
            }
            //根據選擇的類別，更改需要呈現的選單--end--
            var theCategory = $("input[name='theCategory']").val();
            if(theCategory && theCategory.length>0){
                $('#fCategory').val(theCategory);
                $("input[name='theCategory']").val('');
            }
            
            $('#fCategory').trigger('change');
        }             
    });


}


/*  description: 建立系所類別選單內容
 *  create date: 2010.05.17
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_Category_Option($data,m_ftype){
    $('#fCategory').children().remove();
    //if(Select_Option_Data[Lang_Type][m_ftype]['param']){
    if(typeof $data != 'undefined'){
        //$.each(Select_Option_Data[Lang_Type][m_ftype]['param'],function(idx,item){
        $.each($data,function(idx,item){
            html='<option value="'+idx+'">'+item+'</option>';
            $('#fCategory').append(html);
        });	
    }else{
       $.each($data,function(idx,item){
            html='<option value="'+idx+'">'+item+'</option>';
            $('#fCategory').append(html);
        });	 
    }
}

/*  description: 選取系所類別選單動作(change)
 *  create date: 2012.05.17
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_fCategory(){
    $('#fCategory').bind('change',function(){
        if(FType=="3" || FType=="2") {
            get_fCollege();
        }
        else{
            get_fDep();
        }
    });	
}

/*  description: 取得學院列表
 *  create date: 2012.05.17
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_fCollege(){
    m_ftype = $('#fType').val();
    m_fcategory = $('#fCategory').val();
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_college",
        dataType: "json",
        data:{ftype:m_ftype,fcategory:m_fcategory,flang:Lang_Type},
        success: function(json) {
            $data = {};
            $.each(json,function($key,$value){
                $data[$value['CollegeNo']]=$value['CollegeName'];
            });
            delete json;
            build_College_Option($data,m_ftype,m_fcategory);  
            var theCollege = $("input[name='theCollege']").val();
            if(theCollege && theCollege.length > 0 ) {
                $('#fCollege').val(theCollege);
                $("input[name='theCollege']").val('');
            }
            $('#fCollege').trigger('change');
        }             
    });
    

}

/*  description: 建立學院選單內容
 *  create date: 2010.05.17
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_College_Option($data,m_ftype,m_fcategory){
    $('#fCollege').children().remove();
    if(typeof $data != 'undefined'){
        $.each($data,function(idx,item){
            html='<option value="'+idx+'">'+item+'</option>';
            $('#fCollege').append(html);
        });	
    }
    $data = null;
}

/*  description: 選取學院選單動作(change)
 *  create date: 2012.05.18
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_fCollege(){
    $('#fCollege').bind('change',function(){  
        get_fDep();
    });    
}

/*  description: 取得系所列表
 *  create date: 2012.05.17
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_fDep(){
    m_acysem = $('#fAcySem').val();
    m_ftype = $('#fType').val();
    m_fcategory = $('#fCategory').val();
    if(m_ftype!="3" && m_ftype!="2") m_fcollege="*";
    else m_fcollege=$('#fCollege').val();
   
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_dep",
        dataType: "json",
        data:{acysem:m_acysem,ftype:m_ftype,fcategory:m_fcategory,fcollege:m_fcollege,flang:Lang_Type},
        success: function(json) {
            $data = {};
            $.each(json,function($key,$value){
                if( m_acysem < 1011 || ( $value['unit_id']!='312' && $value['unit_id'] !='313' ) ) //2012.07.31--101上以後拿掉312及313
                    $data[$value['unit_id']] = $value['unit_name'];
                $value = null
            });
            json = null;
            delete $key;
            build_Dep_Option($data,m_ftype,m_fcategory,m_fcollege);
            $data = null;
            m_ftype = null;
            m_fcategory = null
            m_fcollege = null
            var theDep = $("input[name='theDep']").val();
            if(theDep && theDep.length > 0 ) {
                $('#fDep').val(theDep);
                $("input[name='theDep']").val('');
            }
            $('#fDep').trigger('change');
        }             
    });
    
    
}

/*  description: 建立系所選單內容
 *  create date: 2010.05.17
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_Dep_Option($data,m_ftype,m_fcategory,m_fcollege){
    $('#fDep').children().remove();
    if(typeof $data != 'undefined'){
        $tmpStr = '';  //--No.00023--add--
        if (Object.keys($data).length == 0){
            $('#fDep').hide();
        }else{
           $.each($data,function(idx,item){
                html='<option value="'+idx+'">'+item+'</option>';
                //--No.00022--start--
                if(m_ftype=='2' && m_fcollege=='C'){ 
                 //--No.00023--start--
                 if(idx=='230' || idx=='217') $tmpStr = html + $tmpStr;
                 else $('#fDep').append(html);
                 //--No.00023--mark--$('#fDep').prepend(html);
                 //--No.00023--end--
                 $('select#fDep')[0].selectedIndex = 0;
                }
                else $('#fDep').append(html);
                //--No.00022--mark--$('#fDep').append(html);
                //--No.00022--end--

                item = null;
            });	
            if(m_ftype=='2' && m_fcollege=='C') $('#fDep').append($tmpStr); //--No.00023--add-- 
        }
        
    }
    
    delete idx;
    $data = null;
}

/*  description: 選取系所選單動作(change)
 *  create date: 2012.05.18
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_fDep(){
    $('#fDep').bind('change',function(){        
        get_fGroup();
    });    
}

/*  description: 取得系所組別列表
 *  create date: 2012.05.18
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_fGroup(){
    m_acysem = $('#fAcySem').val();
    m_ftype = $('#fType').val();
    m_fcategory = $('#fCategory').val();
    if(m_ftype != "3" && m_ftype != "2") m_fcollege = "*";
    else m_fcollege = $('#fCollege').val();
    m_fdep = $('#fDep').val();
    
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_group",
        dataType: "json",
        data:{acysem:m_acysem,ftype:m_ftype,fcategory:m_fcategory,fcollege:m_fcollege,fdep:m_fdep,flang:Lang_Type},
        success: function(json) {
            if(json){
                $data = {};
                $.each(json,function($key,$value){
                    $data[$value['group_id']] = $value['group_name'];
                    $value = null
                });
            }
            json = null;
            delete $key;
            
            build_Group_Option($data,m_ftype,m_fcategory,m_fcollege,m_fdep);
            $data = null;
            m_ftype = null;
            m_fcategory = null;
            m_fcollege = null;
            m_fdep = null; 
            
            $('#fGroup').trigger('change');
        }             
    });
    
}

/*  description: 建立組別選單內容
 *  create date: 2010.05.18
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_Group_Option($data,m_ftype,m_fcategory,m_fcollege,m_fdep){
    //可能會有不分組別的系所，需要先確定$data是否有資料
    $('#fGroup').children().remove();    
    if(Lang_Type=="zh-tw") $('#fGroup').append('<option value="**">全部</option>');
    else $('#fGroup').append('<option value="**">ALL</option>');
    	
    if(typeof $data != 'undefined'){
        $.each($data,function(idx,item){
            if(idx && item){
                html='<option value="'+idx+'">'+item+'</option>';
                $('#fGroup').append(html);
            }            
            item = null;
        });	
    }
    delete idx;
    $data = null;
}

/*  description: 選取系所組別選單動作(change)
 *  create date: 2012.05.29
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_fGroup(){
    $('#fGroup').bind('change',function(){        
        get_fGrade();
    });    
}

/*  description: 取得年級列表
 *  create date: 2012.05.29
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_fGrade(){
    m_acysem = $('#fAcySem').val();
    m_ftype = $('#fType').val();
    m_fcategory = $('#fCategory').val();
    if(m_ftype != "3" && m_ftype != "2") m_fcollege = "*";
    else m_fcollege = $('#fCollege').val();
    m_fdep = $('#fDep').val();
    m_fgroup = $('#fGroup').val();
    
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_grade",
        dataType: "json",
        data:{acysem:m_acysem,ftype:m_ftype,fcategory:m_fcategory,fcollege:m_fcollege,fdep:m_fdep,fgroup:m_fgroup,flang:Lang_Type},
        success: function(json) {
            if(json){
                $data = {};
                $.each(json,function($key,$value){
                    $data[$value['grade_id']] = $value['grade_name'];
                    
                    $value = null
                });
            }
            $value=json;
            json = null;
            delete $key;
            
            build_Grade_Option($data);
            $data = null;
            m_ftype = null;
            m_fcategory = null;
            m_fcollege = null;
            m_fdep = null;
            m_fgroup = null;  
            
            $('#fGrade').trigger('change');
        }             
    });
    

    
}


/*  description: 建立年級選單內容
 *  create date: 2010.05.29
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_Grade_Option($data){
    $('#fGrade').children().remove();    
    if(Lang_Type=="zh-tw") $('#fGrade').append('<option value="**">全部</option>');
    else $('#fGrade').append('<option value="**">ALL</option>');
    	
    if(typeof $data != 'undefined'){
        $.each($data,function(idx,item){
            if(idx && item){
                html='<option value="'+idx+'">'+item+'</option>';
                $('#fGrade').append(html);
            }            
            item = null;
        });	
    }
    delete idx;
    $data = null;
}

/*  description: 選取年級選單動作(change)
 *  create date: 2012.05.29
 *  called by:	$(document).ready
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_fGrade(){
    $('#fGrade').bind('change',function(){        
        get_fClass();
    });    
}

/*  description: 取得年級列表
 *  create date: 2012.05.29
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_fClass(){
    m_acysem = $('#fAcySem').val();
    m_ftype = $('#fType').val();
    m_fcategory = $('#fCategory').val();
    if(m_ftype != "3" && m_ftype != "2") m_fcollege = "*";
    else m_fcollege = $('#fCollege').val();
    m_fdep = $('#fDep').val();
    m_fgroup = $('#fGroup').val();
    m_fgrade = $('#fGrade').val();
    
    $.ajax({
        type: "POST",
        url: modulePath + "?r=main/get_class",
        dataType: "json",
        data:{acysem:m_acysem,ftype:m_ftype,fcategory:m_fcategory,fcollege:m_fcollege,fdep:m_fdep,fgroup:m_fgroup,fgrade:m_fgrade,flang:Lang_Type},
        success: function(json) {
            if(json){
                $data = {};
                $.each(json,function($key,$value){
                    $data[$value['class_id']] = $value['class_name'];
                    
                    $value = null
                });
            }
            json = null;
            delete $key;
            
            build_Class_Option($data);
            $data = null;
            m_ftype = null;
            m_fcategory = null;
            m_fcollege = null;
            m_fdep = null;
            m_fgroup = null;
            m_fgrade = null;
            
            $('#fClass').trigger('change');
        }             
    });
    
}

/*  description: 建立班級選單內容
 *  create date: 2010.05.29
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_Class_Option($data){
    $('#fClass').children().remove();    
    if(Lang_Type=="zh-tw") $('#fClass').append('<option value="**">全部</option>');
    else $('#fClass').append('<option value="**">ALL</option>');
    	
    if(typeof $data != 'undefined'){
        $.each($data,function(idx,item){
            if(idx && item){
                html='<option value="'+idx+'">'+item+'</option>';
                $('#fClass').append(html);
            }            
            item = null;
        });	
    }
    delete idx;
    $data = null;
}

/*  description: 更換語言
 *  create date: 2012.05.16
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function change_flang(){
    $('#flang').bind('change',function(){
        Lang_Type = $('#flang').val();
        get_view_html_content('timetable_menu',Lang_Type);
        //change_flang();
//        get_timetable_menu_html(Lang_Type);
//        load_default_function();
//        build_time_classroom_code_table();
    });
}

/*  description: 點選搜尋按鈕動作
 *  create date: 2012.07.19
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function click_Search_button(){
    $('#crstime_search').bind('click',function(){
        m_acy='**';
        m_sem='**';
        m_degree='**';
        m_dep_id='**';
        m_group='**';
        m_grade='**';
        m_class='**';
        //m_qtype=$('#qtype').val();
        m_option='**';
        m_crsname='**';
        m_teaname='**';
        m_cos_id='**';
        m_cos_code='**';
        m_crstime='**';
        m_crsoutline='**';
        m_costype='**';
        Chk_Acysem = false;
        Chk_Dep = false;
        Chk_Option = false;
        if($('#chkAcySem:checked').length > 0){//學年度學期別已選取
            m_acysem = $('#fAcySem').val();
            m_sem = m_acysem.substr(m_acysem.length-1,1);
            m_acy = m_acysem.substr(0,m_acysem.length-1);
            Chk_Acysem = true;
        }
        
        if($('#chkDep:checked').length > 0){ //開課系所已選取
            if($('#fDep').val()){ 
                m_unit_id = $('#fDep').val();
                m_degree = m_unit_id.substr(0,1);
                m_dep_id = m_unit_id.substr(1,m_unit_id.length);
                
            }        	
            
            if($('#fGroup').val()) m_group=$('#fGroup').val();
            if($('#fGrade').val()) m_grade=$('#fGrade').val();
            if($('#fClass').val()) m_class=$('#fClass').val();
            Chk_Dep = true;
        }
        
        if($('#chkOption:checked').length > 0){ //特定條件已選取
            if($("input[type=radio][name='qryse']:checked").val()) m_option = $("input[type=radio][name='qryse']:checked").val();
            if(m_option=="crsname" && $("input[type='text'][name='crsname']").val()) m_crsname = $("input[type='text'][name='crsname']").val(); //課程名稱
            if(m_option=="teaname" && $("input[type='text'][name='teaname']").val()) m_teaname = $("input[type='text'][name='teaname']").val(); //開課教師姓名
            if(m_option=="cos_id" && $("input[type='text'][name='cos_id']").val()) m_cos_id = $("input[type='text'][name='cos_id']").val(); //當期課號
            if(m_option=="cos_code" && $("input[type='text'][name='cos_code']").val()) m_cos_code = $("input[type='text'][name='cos_code']").val(); //永久課號
            if(m_option=="crstime" && $("input[type='text'][name='crstime']").val()) m_crstime = $("input[type='text'][name='crstime']").val(); //選取特定時段            
            if(m_option=="crsoutline" && $("input[type='text'][name='crsoutline']").val()) m_crsoutline = $("input[type='text'][name='crsoutline']").val(); //課程綱要內容
            if(m_option=="costype" && $("select[name='costype']").val()) m_costype = $("select[name='costype']").val(); //課程類別
            if(m_option!='**') Chk_Option = true;
        }
        
        //--No.00020--start--
        if($('#chkDep').prop("checked") &&  typeof $('#fCategory').val() != 'undefined' && $('#fCategory').val()=='0U'){ //橋接課程 --No.00021--add--$('#chkDep').attr("checked") &&--
            m_option="approved_General";            
        }
        //--No.00020--end--
        
        //通識選修(外系支援)
        if($('#chkDep').prop("checked") &&  typeof $('#fCategory').val() != 'undefined' && $('#fDep').val()=='0U5*'){ 
            m_option="dep_approved_General";
            m_degree="**";
            m_dep_id="**";
        }
        
        
        if( typeof Chk_Acysem != 'undefined' || typeof Chk_Dep != 'undefined' || typeof Chk_Option != 'undefined'){
            acysem = $('#tbl_timetable_menu').find('input[name="acysem"][value="acysem"]').is(":checked");
            cos_id = $('#tbl_timetable_menu').find('input[name="cos_id"][value="cos_id"]').is(":checked");
            cos_code = $('#tbl_timetable_menu').find('input[name="cos_code"][value="cos_code"]').is(":checked");
            brief = $('#tbl_timetable_menu').find('input[name="brief"][value="brief"]').is(":checked");
            cos_name = $('#tbl_timetable_menu').find('input[name="cos_name"][value="cos_name"]').is(":checked");
            num_limit = $('#tbl_timetable_menu').find('input[name="num_limit"][value="num_limit"]').is(":checked");
            reg_num = $('#tbl_timetable_menu').find('input[name="reg_num"][value="reg_num"]').is(":checked");
            cos_time = $('#tbl_timetable_menu').find('input[name="cos_time"][value="cos_time"]').is(":checked");
            cos_credit = $('#tbl_timetable_menu').find('input[name="cos_credit"][value="cos_credit"]').is(":checked");
            cos_hours = $('#tbl_timetable_menu').find('input[name="cos_hours"][value="cos_hours"]').is(":checked");
            teacher = $('#tbl_timetable_menu').find('input[name="teacher"][value="teacher"]').is(":checked");
            cos_type = $('#tbl_timetable_menu').find('input[name="cos_type"][value="cos_type"]').is(":checked");
            memo = $('#tbl_timetable_menu').find('input[name="memo"][value="memo"]').is(":checked");
            cos_othername = $('#tbl_timetable_menu').find('input[name="cos_othername"][value="cos_othername"]').is(":checked");
            
            if(acysem||cos_id||cos_code||brief||cos_name||num_limit||reg_num||cos_time||cos_credit||cos_hours||teacher||cos_type||memo||cos_othername){
                $('#div_loading').addClass("loading"); //增加載入中的圖示    
                $.ajax({
                    type: "POST",
                    url: modulePath + "?r=main/get_cos_list",
                    dataType: "json",
                    data:{m_acy:m_acy,m_sem:m_sem,m_degree:m_degree,m_dep_id:m_dep_id,m_group:m_group,m_grade:m_grade,m_class:m_class,m_option:m_option,m_crsname:m_crsname,m_teaname:m_teaname,m_cos_id:m_cos_id,m_cos_code:m_cos_code,m_crstime:m_crstime,m_crsoutline:m_crsoutline,m_costype:m_costype},
                    success: function(json) {
                        Cos_Data_List = json;
                        json = null;
                        get_view_html_content('timetable_main_table',Lang_Type);
                    }             
                });
                   
            }else{
                if(Lang_Type=='zh-tw') alert("請至少選擇一個顯示欄位");
                else alert("Please choose at the least one display column.");
            }

                    	
            
        }
        else{
            if(Lang_Type=='zh-tw') alert("請選擇搜尋條件");
            else alert("Please choose the option.");
        }    
    });
}

/*  description: 點選選取特定時間按鈕動作
 *  create date: 2012.07.19
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function click_choose_time_button(){
    $('#choose_time').bind('click',function(){
        $('input[type="radio"][name="qryse"][value="crstime"]').prop("checked", true);
        if(typeof Timetable_Choose_Time_Html == 'undefined'){
            $.ajax({
                  type:'post',
            	  url: modulePath + '?r=main/getViewHtmlContents',
            	  context: document.body,
                  data:{fun:'timetable_choose_time',fLang:''},
            	  success: function(data){
                    if(data) Timetable_Choose_Time_Html=data;
                    else Timetable_Choose_Time_Html='';	
                    data = null;
                    if(typeof Timetable_Choose_Time_Html !='undefined'){
                        $.prompt(Timetable_Choose_Time_Html,{
                            loaded: function(){
                                //還原之前選取的項目
                                chk_time = $('#crstime').val().split(',');
                                $.each(chk_time,function(idx,item){
                                    $('#time').find('input[type="checkbox"][name="daytime_'+item+'"]').prop("checked", true);
                                    item = null;
                                });

                                chk_time = null;
                                idx = null;
                            },
                            submit: function(v,m){ 
                                //擷取選取的項目更新至crstime
                                tmpstr='';
                                $.each($('input[type="checkbox"][name*="daytime"]:checked'),function(idx,item){
                                    tmpstr = tmpstr + $(this).val()+',';
                                    item = null;
                                });
                                $('#crstime').val(tmpstr.substr(0,tmpstr.length-1));
                                idx = null;
                                tmpstr = null;
                            }                	
                        });
                    }                    
            	  }
            });
        }

    });
}

/*  description: 偵測選取或取消學年度學期別的動作
 *  create date: 2012.07.23
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function check_click_chkAcySem_checkbox(){
    $('#chkAcySem').bind('click',function(){
        //只有在特定條件被選取的狀態，才能取消
        if(!$(this).prop("checked") && !$('#chkOption').prop("checked")){ 
            $('#chkDep_msg').html('選擇特定條件才能取消');
            $(this).prop("checked", true);
        }
    });
}

/*  description: 偵測選取或取消開課系所的動作
 *  create date: 2012.07.23
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function check_click_chkDep_checkbox(){
    $('#chkDep').bind('click',function(){
        //只有在特定條件被選取的狀態，才能取消
        if(!$(this).prop("checked") && !$('#chkOption').prop("checked")){ 
            $(this).prop("checked", true);
            $('#chkDep_msg').html('選擇特定條件才能取消');
        }
        
    });
}

/*  description: 偵測選取或取消特定條件的動作
 *  create date: 2012.07.23
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function check_click_chkOption_checkbox(){
    $('#chkOption').bind('click',function(){
        if(!$(this).prop("checked")) {
            $('#chkAcySem').attr('checked','true');
            $('#chkDep').attr('checked','true');
            chkOption_show_hide(false);
        }
        else{
            $('#chkDep').attr('checked',false); //--No.00024--add--        	
            chkOption_show_hide(true);
        }
    });
}

/*  description: 載入timetable_main_table html
 *  create date: 2012.07.23
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_timetable_main_table_html(m_flang){
    if(typeof m_flang == 'undefined') m_flang=Lang_Type;
    //產生timetable_main_table內容
    $('#timetable_main').html(''); //先清除內容
    //增加附註說明
    if(Lang_Type=="en-us") $('#timetable_main').append('<div style="color:red;margin:10px;">※Registered numbers will be hidden during course add-and-drop period.</div>');
    else $('#timetable_main').append('<div style="color:red;margin:auto;width:65%;"><div style="text-align:left;padding:10px;">註1：當學期之「修課人數」於選課期間不顯示，若需要此資訊請至選課系統查看！</br>註2：【通識向度】106學年度以後入學同學僅適用***(106)；105學年度以前的同學請擇一適用。</div></div>');
    
    $.each(Cos_Data_List,function(idx,item){
        if(typeof item != 'undefined'){
            $dep_id=item["dep_id"];
            $dep_name=(Lang_Type=="zh-tw")?item["dep_cname"]:item["dep_ename"];
            //主開
            build_timetable_main_table_content('1',$dep_id,$dep_name,item[1],item['costype'],item['brief'],item['language']);
            //輔開
            if(typeof item[2] != 'undefined') build_timetable_main_table_content('2',$dep_id,$dep_name,item[2],item['costype'],item['brief'],item['language']);
            
            $('#timetable_main').append('<br /><p /><br />');
            $dep_id = null;
            $dep_name = null;
        }
    });

}

/*  description: 產生timetable_main_table內容
 *  create date: 2012.07.25
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_timetable_main_table_content($primary,$dep_id,$dep_name,$data,$costype,$brief,$language){
    acysem = $('#tbl_timetable_menu').find('input[name="acysem"][value="acysem"]').is(":checked");
    cos_id = $('#tbl_timetable_menu').find('input[name="cos_id"][value="cos_id"]').is(":checked");
    cos_code = $('#tbl_timetable_menu').find('input[name="cos_code"][value="cos_code"]').is(":checked");
    brief = $('#tbl_timetable_menu').find('input[name="brief"][value="brief"]').is(":checked");
    cos_name = $('#tbl_timetable_menu').find('input[name="cos_name"][value="cos_name"]').is(":checked");
    cos_othername = $('#tbl_timetable_menu').find('input[name="cos_othername"][value="cos_othername"]').is(":checked");
    num_limit = $('#tbl_timetable_menu').find('input[name="num_limit"][value="num_limit"]').is(":checked");
    reg_num = $('#tbl_timetable_menu').find('input[name="reg_num"][value="reg_num"]').is(":checked");
    cos_time = $('#tbl_timetable_menu').find('input[name="cos_time"][value="cos_time"]').is(":checked");
    cos_credit = $('#tbl_timetable_menu').find('input[name="cos_credit"][value="cos_credit"]').is(":checked");
    cos_hours = $('#tbl_timetable_menu').find('input[name="cos_hours"][value="cos_hours"]').is(":checked");
    teacher = $('#tbl_timetable_menu').find('input[name="teacher"][value="teacher"]').is(":checked");
    cos_type = $('#tbl_timetable_menu').find('input[name="cos_type"][value="cos_type"]').is(":checked");
    memo = $('#tbl_timetable_menu').find('input[name="memo"][value="memo"]').is(":checked");
    
    $table_id = $dep_id+'_'+$primary;
    html = Timetable_Main_Table_Html[Lang_Type].replace('<-!-replace_id-!->',$table_id);
    $('#timetable_main').append(html);
    if($primary=='1') $('#'+$table_id+' caption').html('《'+$dep_name+'》'+$('#'+$table_id+' caption').html());
    else if(Lang_Type=="en-us") $('#'+$table_id+' caption').html('《'+$dep_name+'》'+$('#'+$table_id+' caption').html()+'--Other teaching units curriculum');
    else $('#'+$table_id+' caption').html('《'+$dep_name+'》'+$('#'+$table_id+' caption').html()+'--其他相關教學單位課程');
    	
    if(typeof $data != 'undefined'){
        $row_num=1;
        $.each($data,function(idx,item){
            $chk_primary_2 = true;
            if($primary=='2' && typeof Cos_Data_List[$dep_id][1] != 'undefined' && typeof Cos_Data_List[$dep_id][1][item['acy']+item['sem']+'_'+item['cos_id']] != 'undefined') $chk_primary_2 = false;
            if(typeof item['acy'] != 'undefined' && $chk_primary_2){
                m_acysem = (Lang_Type=="zh-tw")?item['acy']+Chinese_Semester[item['sem']]:item['acy']+English_Semester[item['sem']]; //學期別
                
                //課號+課程綱要連結
                if(typeof item['crsoutline_type'] != 'undefined' && item['crsoutline_type']=='file' )
                    m_cos_id = '<a href="?r=main/crsoutlinefile&Acy='+item['acy']+'&Sem='+item['sem']+'&CrsNo='+item['cos_id']+'&lang='+Lang_Type+'" target="_blank">' + item['cos_id'] +'</a>';
                else if(typeof item['crsoutline_type']!= 'undefined' && item['crsoutline_type']=='data' )
                    m_cos_id = '<a href="?r=main/crsoutline&Acy='+item['acy']+'&Sem='+item['sem']+'&CrsNo='+item['cos_id']+'&lang='+Lang_Type+'" target="_blank">' + item['cos_id'] +'</a>';
                else
                m_cos_id = item['cos_id'];
                m_cos_code = item['cos_code']; //永久課號
                m_brief = item['brief']; //摘要
                m_cos_name = (Lang_Type=="zh-tw")?item['cos_cname']:item['cos_ename']; //課程名稱
                m_cos_name = (item['URL']&& item['URL'].replace(/(^\s*)|(\s*$)/g, "").length > 0)? '<a href="'+item['URL'] +'" target="_blank" >'+m_cos_name+'</a>':m_cos_name;
                m_cos_othername = (Lang_Type=="zh-tw")?item['cos_ename']:item['cos_cname'];
                m_num_limit = (item['num_limit'] > "999")? (Lang_Type=="zh-tw")?'不限':'Unlimited':item['num_limit']; //人數上限
                m_reg_num = (item['reg_num'] > "-999")? item['reg_num']:'-'; //修課上限 //--No.00019--add--
                m_cos_time = item['cos_time']; //上課時間及教室
                m_cos_credit = item['cos_credit']; //學分
                m_cos_hours = item['cos_hours']; //時數
                m_teacher = (item['TURL'] && item['TURL'].replace(/(^\s*)|(\s*$)/g, "").length > 0)? '<a href="'+item['TURL'] +'" target="_blank" >'+item['teacher']+'</a>':item['teacher']; //開課教師
                m_cos_type = (Lang_Type=="zh-tw")?item['cos_type']:item['cos_type_e']; //選別
                if(item['memo']) m_memo = item['memo'].replace(/(^\s*)|(\s*$)/g, ""); //備註
                
                //有備註時要需要合併欄位
                if(typeof m_memo != 'undefined' && m_memo.length > 0) $rowspan = ' rowspan="2" ';
                else $rowspan='';
                	
                //列顏色
                if($row_num%2==1) $rowcolor = 'background:#D6FCFB;';
                else $rowcolor = 'background:#F0FFFF;';
                	
                //百年字元排序問題
                if(item['acy'] < 100) $tr_name = "tr_two_char";
                else $tr_name = "tr_three_char";

                html = '<tr name="' + $tr_name + '">';
                html = html + '<td ' + $rowspan + ' style="' + $rowcolor + 'width:70px;" name="acysem">' + m_acysem + '</td>';
                html = html + '<td ' + $rowspan + ' style="' + $rowcolor + 'width:50px;"  name="cos_id">' + m_cos_id + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:70px;" name="cos_code">' + m_cos_code + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:70px;" name="brief">' ;
                
                if(typeof $brief[item['acy']+item['sem']+'_'+item['cos_id']] != 'undefined'){
                    $.each($brief[item['acy']+item['sem']+'_'+item['cos_id']],function(idx,item){
                        var brief_code = item['brief_code'];
                        var brief = item['brief'];
                        brief = brief.replace(",", "</br>");
                        
                        html += brief;
                    });                    
                }
                html += '</td>';
                
                html = html + '<td style="' + $rowcolor + 'text-align:left;width:230px;" name="cos_name">' + m_cos_name + '<br>';
                if(typeof $costype[item['acy']+item['sem']+'_'+item['cos_id']] != 'undefined'){
                    $.each($costype[item['acy']+item['sem']+'_'+item['cos_id']],function(idx,item){
                        c_result = item['course_category_cname'].substring((item['course_category_cname'].indexOf('_')+1), item['course_category_cname'].length);
                        c_result_ori = item['course_category_cname'].substring(0, (item['course_category_cname'].indexOf('_')));
                        e_result = item['course_category_ename'].substring((item['course_category_ename'].indexOf('_')+1), item['course_category_ename'].length);
                        e_result_ori = item['course_category_ename'].substring(0, (item['course_category_ename'].indexOf('_')));
                        c_geci = item['GECIName'];
                        e_geci = item['GECIEngName'];
                        switch(item['course_category_type']){
                            case "3":
                                html += '<span class="label label-costype-3"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "4":
                                html += '<span class="label label-costype-4"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "5":
                                html += '<span class="label label-costype-5"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "7":
                                html += '<span class="label label-costype-7"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "8":
                                html += '<span class="label label-costype-8"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "9":
                                html += '<span class="label label-costype-9"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "10":
                                html += '<span class="label label-costype-10"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "11":
                                html += '<span class="label label-costype-11"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "12":
                                html += '<span class="label label-costype-12"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "13":
                                html += '<span class="label label-costype-13"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "14":
                                html += '<span class="label label-costype-14"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "15": //通識校基本
                                html += '<span class="label label-costype-15"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "16": //通識跨院
                                html += '<span class="label label-costype-16"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += '[';
                                    html += e_geci;
                                    html += '] ';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += '[';
                                    html += c_geci;
                                    html += '] ';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                            case "17": //通識核心
                                html += '<span class="label label-costype-17"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+e_result_ori+'">';
                                    html += e_result;
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="'+c_result_ori+'">';
                                    html += c_result;
                                }
                                html += '</span>';
                                break;
                        }
                    });
                }
                
                if (typeof $language[item['acy']+item['sem']+'_'+item['cos_id']] != 'undefined'){
                    $.each($language[item['acy']+item['sem']+'_'+item['cos_id']],function(idx,item){
                        if (item === "en-us"){
                            html += '<span class="label label-costype-13"';
                                if(Lang_Type=="en-us"){
                                    html += 'data-toggle="tooltip" data-placement="left" title="English Medium Courses">';
                                    html += 'ENG';
                                }else{
                                    html += 'data-toggle="tooltip" data-placement="left" title="英文授課">';
                                    html += '英文授課';
                                }
                            html += '</span>';
                        }
                    });
                }
                html += '</td>';
                html = html + '<td style="' + $rowcolor + 'width:70px;" name="cos_othername">' + m_cos_othername + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:70px;" name="num_limit">' + m_num_limit + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:70px;" name="reg_num">' + m_reg_num + '</td>'; //--No.00019--add--
                html = html + '<td style="' + $rowcolor + 'width:130px;" name="cos_time">' + m_cos_time + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:50px;" name="cos_credit">' + m_cos_credit + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:50px;" name="cos_hours">' + m_cos_hours + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:90px;" name="teacher">' + m_teacher + '</td>';
                html = html + '<td style="' + $rowcolor + 'width:60px;" name="cos_type">' + m_cos_type + '</td>';
                html = html + '</tr>';
                if($rowspan.length > 0){
                    html = html + '<tr name="' + $tr_name + '">';
                    html = html + '<td colspan="11" style="' + $rowcolor + 'text-align:left;" name="memo">' + m_memo + '</td>';
                    html = html + '</tr>';
                }
                $('#timetable_main tr:last').after(html); 
                //console.log();
                /*原為了解決百年蟲排序問題，已改使用PHP排序。
                if($row_num=='1') $('#timetable_main tr:last').after(html); //第一筆
                else if($tr_name == "tr_two_char" && $('#timetable_main tr[name="tr_two_char"]').length==0 ) $('#timetable_main tr:has("th"):last').after(html);
                else $('#timetable_main tr[name="' + $tr_name + '"]:last').after(html);*/
                $row_num++;
            }
        });
    }
    
    if (acysem!=true){
        $('#timetable_main').find('td[name="acysem"]').hide();
        $('#timetable_main').find('th[headers="acysem"]').hide();
    }else{
        $('#timetable_main').find('td[name="acysem"]').show();
        $('#timetable_main').find('th[headers="acysem"]').show();
    }
    
    if (cos_id!=true){
        $('#timetable_main').find('td[name="cos_id"]').hide();
        $('#timetable_main').find('th[headers="cos_id"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_id"]').show();
        $('#timetable_main').find('th[headers="cos_id"]').show();
        
    }
    
    if (cos_code!=true){
        $('#timetable_main').find('td[name="cos_code"]').hide();
        $('#timetable_main').find('th[headers="cos_code"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_code"]').show();
        $('#timetable_main').find('th[headers="cos_code"]').show();
    }
    
    if (brief!=true){
        $('#timetable_main').find('td[name="brief"]').hide();
        $('#timetable_main').find('th[headers="brief"]').hide();
    }else{
        $('#timetable_main').find('td[name="brief"]').show();
        $('#timetable_main').find('th[headers="brief"]').show();
    }
    
    if (cos_name!=true){
        $('#timetable_main').find('td[name="cos_name"]').hide();
        $('#timetable_main').find('th[headers="cos_name"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_name"]').show();
        $('#timetable_main').find('th[headers="cos_name"]').show();
    }
    
    if (cos_othername!=true){
        $('#timetable_main').find('td[name="cos_othername"]').hide();
        $('#timetable_main').find('th[headers="cos_othername"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_othername"]').show();
        $('#timetable_main').find('th[headers="cos_othername"]').show();
    }
    
    if (num_limit!=true){
        $('#timetable_main').find('td[name="num_limit"]').hide();
        $('#timetable_main').find('th[headers="num_limit"]').hide();
    }else{
        $('#timetable_main').find('td[name="num_limit"]').show();
        $('#timetable_main').find('th[headers="num_limit"]').show();
    }
    
    if (reg_num!=true){
        $('#timetable_main').find('td[name="reg_num"]').hide();
        $('#timetable_main').find('th[headers="reg_num"]').hide();
    }else{
        $('#timetable_main').find('td[name="reg_num"]').show();
        $('#timetable_main').find('th[headers="reg_num"]').show();
    }
    
    if (cos_time!=true){
        $('#timetable_main').find('td[name="cos_time"]').hide();
        $('#timetable_main').find('th[headers="cos_time"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_time"]').show();
        $('#timetable_main').find('th[headers="cos_time"]').show();
    }
    
    if (cos_credit!=true){
        $('#timetable_main').find('td[name="cos_credit"]').hide();
        $('#timetable_main').find('th[headers="cos_credit"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_credit"]').show();
        $('#timetable_main').find('th[headers="cos_credit"]').show();
    }
    
    if (cos_hours!=true){
        $('#timetable_main').find('td[name="cos_hours"]').hide();
        $('#timetable_main').find('th[headers="cos_hours"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_hours"]').show();
        $('#timetable_main').find('th[headers="cos_hours"]').show();
    }
    
    if (teacher!=true){
        $('#timetable_main').find('td[name="teacher"]').hide();
        $('#timetable_main').find('th[headers="teacher"]').hide();
    }else{
        $('#timetable_main').find('td[name="teacher"]').show();
        $('#timetable_main').find('th[headers="teacher"]').show();
    }
    
    if (cos_type!=true){
        $('#timetable_main').find('td[name="cos_type"]').hide();
        $('#timetable_main').find('th[headers="cos_type"]').hide();
    }else{
        $('#timetable_main').find('td[name="cos_type"]').show();
        $('#timetable_main').find('th[headers="cos_type"]').show();
    }
    
    if (memo!=true){
        $('#timetable_main').find('td[name="memo"]').hide();
        $('#timetable_main').find('th[headers="memo"]').hide();
        $('#timetable_main').find('th[headers="acysem"]').removeAttr("rowspan" );
        $('#timetable_main').find('th[headers="cos_id"]').removeAttr("rowspan" );
        $('#timetable_main').find('td[name="acysem"]').removeAttr("rowspan" );
        $('#timetable_main').find('td[name="cos_id"]').removeAttr("rowspan" );
    }else{
        $('#timetable_main').find('td[name="memo"]').show();
        $('#timetable_main').find('th[headers="memo"]').show();
    }
    
    $('#timetable_main').append('<br />');
    
}

/*  description: 產生timetable_main_table內容
 *  create date: 2012.07.26
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function click_foption_tr_text(){
    $('tr.foption').find('input[type="text"]').bind('click',function(){
        $('input[type="radio"][name="qryse"][value="'+$(this).attr('name')+'"]').prop("checked", true);
    });
    $('tr.foption').find('select[name="costype"]').bind('click',function(){
        $('input[type="radio"][name="qryse"][value="'+$(this).attr('name')+'"]').prop("checked", true);
    });
}

/*  description: 取得星期／時間／教室代碼對照表資料
 *  create date: 2012.07.30
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function get_time_classroom_code(){
    if(typeof Time_Code == 'undefined'){
        $.ajax({
            type: "POST",
            url: modulePath + "?r=main/get_time_code",
            dataType: "json",
            data:{},
            success: function(json) {
                Time_Code = json;
                json = null;

                if(typeof Classroom_Code == 'undefined'){
                    $.ajax({
                        type: "POST",
                        url: modulePath + "?r=main/get_classroom_code",
                        dataType: "json",
                        data:{},
                        success: function(json) {
                            Classroom_Code = json;
                            json = null;
                            
                            build_time_classroom_code_table();
                        }             
                    });
                }	                
            }             
        });
    }	
    else {
        build_time_classroom_code_table();
    }


}

/*  description: 產生星期／時間／教室代碼對照表
 *  create date: 2012.07.30
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function build_time_classroom_code_table(m_flang){
    classroom_divide_num = 4;
	
    if(typeof m_flang == 'undefined') m_flang=Lang_Type;
    
        $.ajax({
        	  type:'post',
        	  url: modulePath + "?r=main/getViewHtmlContents",
        	  context: document.body,
        	  data:{fun:'timetable_time_classroom_code',fLang:m_flang},
        	  success: function(data){
                if(data) Time_Classroom_Code_Html[m_flang]=data;
                else Time_Classroom_Code_Html[m_flang]='';	
                data = null;
                
                //載入Default html
                $('#timetable_main').html(Time_Classroom_Code_Html[m_flang]);

                //更新時間代碼內容
                $('#div_time_classroom_code .tbl_time').html('');

                html='';
                $.each(Time_Code['codeArray'],function(idx,item){
                    html=html+'<tr>';
                    $.each(item,function(idx2,item2){
                        $m_code = (Time_Code['time_code'][item2] && Time_Code['time_code'][item2]['code'])?Time_Code['time_code'][item2]['code']:'&nbsp;';
                        $m_time = (Time_Code['time_code'][item2] && Time_Code['time_code'][item2]['time'])?Time_Code['time_code'][item2]['time']:'&nbsp;';
                        html=html+'<th>'+$m_code+'</th>';
                        html=html+'<td>'+$m_time+'</td>';            
                    });
                    html=html+'</tr>';
                });
                $('#div_time_classroom_code .tbl_time').append(html);

                //更新教室代碼內容
                $('#div_time_classroom_code .tbl_classroom').html('');
                html='';
                num = 1;
                $.each(Classroom_Code,function(idx,item){
                    $m_build_name = (m_flang== 'en-us')?item['ename']:item['cname'];
                    $tr_class = (num%2==1)? 'tr_classroom_odd':'tr_classroom_even';
                    html = html + '<tr class="' + $tr_class + '">';
                    html = html + '<th rowspan="' + Math.ceil(item['build_num']/classroom_divide_num) + '">' + $m_build_name + '</th>';
                    int=0;
                    $.each(item['code'],function(idx2,item2){
                        if(int > 0 && int%classroom_divide_num==0){
                            html = html + '</tr>';
                            html = html + '<tr class="' + $tr_class + '">';
                        }
                        $m_name = (m_flang== 'en-us')?item2['ename']:item2['cname'];
                        html = html + '<td class="rm_code">' + idx2 + '</td>';
                        html = html + '<td class="rm_name">' + $m_name + '</td>';
                        int++;

                        if( int%classroom_divide_num > 0 && int==item['build_num']){
                            //console.log($m_build_name);
                            //console.log(classroom_divide_num-int%classroom_divide_num);
                            for($j=1 ; $j <= classroom_divide_num-int%classroom_divide_num ; $j++){
                                html = html + '<td class="rm_code">&nbsp;</td>';
                                html = html + '<td class="rm_name">&nbsp;</td>';                    
                            }
                            html = html + '</tr>';
                        }

                    });
                    html = html + '</tr>';
                    delete int;
                    num++;
                });
                delete num;
                $('#div_time_classroom_code .tbl_classroom').append(html);                
        	  }
        });

}

/*  description: 離開頁面時刪除global varable
 *  create date: 2012.01.04
 *  called by:	none
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
window.onbeforeunload = function () {
    Timetable_Menu_Html = null;
    Acy_Sem = null;
    Lang_Type = null;
    FType = null;
    Timetable_Choose_Time_Html = null;
    Timetable_Main_Table_Html = null;
    English_Semester = null;
    Chinese_Semester = null;
    Cos_Data_List = null;
    Chk_Acysem = null;
    Chk_Dep = null;
    Chk_Option = null;
    Time_Code = null;
    Classroom_Code = null;
    Time_Classroom_Code_Html = null;
}

/*  description: tab的特效，需對應特定的tag，及特定的css。
 *  called by:	
 *  modify Record:（--No--modify date--author--modify method(add,modify,del)--modify brief--）
 *  -------------------------------------------------------------------------------
 *  --No.00001--            	
 */
function tabs(tab_num){
            	
    // 預設顯示第一個 Tab
    var _showTab = tab_num;
    $('.abgne_tab').each(function(){
        // 目前的頁籤區塊
        var $tab = $(this);
	
        $('ul.tabs li', $tab).eq(_showTab).addClass('active');
        $('.tab_content', $tab).hide().eq(_showTab).show();
        
        // 當 li 頁籤被點擊時...
        // 若要改成滑鼠移到 li 頁籤就切換時, 把 click 改成 mouseover
        $('ul.tabs li', $tab).click(function() {
            // 找出 li 中的超連結 href(#id)
            	_clickTab = $(this).find('a').attr('href');
            // 把目前點擊到的 li 頁籤加上 .active
            // 並把兄弟元素中有 .active 的都移除 class
            $(this).addClass('active').siblings('.active').removeClass('active');
            // 淡入相對應的內容並隱藏兄弟元素
            $(_clickTab).stop(false, true).fadeIn().siblings().hide();
            
            Tab_Idx=$(this).index();
            
            return false;
            delete _clickTab;
        }).find('a').focus(function(){
            this.blur();
        });
        
        $tab = null;
    });	
    
    _showTab = null;
}

//載入view網頁
function get_view_html_content(fun,fLang){
    switch (fun){
        case "timetable_menu":
            if(!Timetable_Menu_Html || !Timetable_Menu_Html[fLang]){
                $.ajax({
                    type:'post',          
                    url: modulePath + '?r=main/getViewHtmlContents',
                    context: document.body,
                    ifModified:true,
                    data:{fun:fun,fLang:fLang},
                    success: function(data){
                        if(data) Timetable_Menu_Html[fLang]=data;
                        else Timetable_Menu_Html[fLang]='';
                        get_timetable_menu_html(fLang);
                        load_default_function();
                        data = null;
                    }
                });
            }
            else {
                get_timetable_menu_html(fLang);
                load_default_function();                
            }
            break;
        case "timetable_main_table":
            if(!Timetable_Main_Table_Html || !Timetable_Main_Table_Html[fLang]){
                $.ajax({
                    type:'post',          
                    url: modulePath + '?r=main/getViewHtmlContents',
                    context: document.body,
                    ifModified:true,
                    data:{fun:fun,fLang:fLang},
                    success: function(data){
                        if(data) Timetable_Main_Table_Html[fLang]=data;
                        else Timetable_Main_Table_Html[fLang]='';	
                        data = null;
                        get_timetable_main_table_html();
                        $('#div_loading').removeClass("loading"); //移除載入中的圖示
                    }
                });
            }
            else{
                get_timetable_main_table_html();
                $('#div_loading').removeClass("loading"); //移除載入中的圖示
            }
            break;    
    }
    
}
