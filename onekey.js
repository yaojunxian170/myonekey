/**
 * 一键增删改查功能
 * 
 * 显示参数(chu1k:除以1000,cheng1k:乘以1000,chu60:除以60，cheng60乘以60，chu1b：除以100,cheng1b乘以100,time为日期)
 * 编辑参数("" or "input" 为文本输入框,"select"为下拉列表框)
 */
//页面加载完成
$(document).ready(function(){
    initTab();
    queryData();
});
//日期格式转换方法
var format = function(time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
}

//字段描述["字段名称","字段描述","显示方法","编辑方法","是否可操作","是否为数值","下拉框数据","列宽度"]
function fieldObj(field,fieldDesc,showType,editType,canEdit,isNumber,selectData,colWidth)
{
    this.field=field;
    this.fieldDesc=fieldDesc;
    this.showType=showType;
    this.editType=editType;
    this.canEdit=canEdit;
    this.isNumber=isNumber;
    this.selectData=selectData;
    this.colWidth=colWidth;

    this.show = funShow;//显示
    function funShow(value){
        return funShowInner(value,this.showType);
    }
    function funShowInner(value,type){
        if(type==""){return value;}
        else if(type=="time"){return format(value*1000, 'yyyy-MM-dd HH:mm');}
        else if(type=="chu1k"){return parseInt(value) / 1000;}
        else if(type=="cheng1k"){return parseInt(value) * 1000;}
        else if(type=="chu60"){return parseInt(value) / 60;}
        else if(type=="cheng60"){return parseInt(value) * 60;}
        else if(type=="chu1b"){return parseInt(value) / 100;}
        else if(type=="cheng1b"){return parseInt(value) * 100;}
        else if(type=="select"){return selectData[value];}
    }
    this.add = funAdd;//增加
    function funAdd(){
        if(!this.canEdit)return "XXX";
        if(editType=="" ||editType=="input"){
            return "<input style='width:60px' "+(this.isNumber?"onkeyup='clearNoNum(this)'":"")+" name='"
            +this.field+"' value=''/>"
        }else if(editType=="select"){
            var html = ["<select style='width:60px'>"], selected = '';
            for(var i in this.selectData) {
                selected = i == 0 ? 'selected' : '';
                html.push("<option value='" + i + "'" + selected + ">" + this.selectData[i] + "</option>");
            }
            html.push("</select>");
            return html.join(" ");
        }
    }
    this.edit = funEdit;//编辑
    function funEdit(value){
        if(!this.canEdit)return funShowInner(value,this.showType);
        if(editType=="" ||editType=="input"){
            return "<input style='width:60px' "+(this.isNumber?"onkeyup='clearNoNum(this)'":"")+" name='"
            +this.field+"' value='"+funShowInner(value,this.showType)+"'/>"
        }else if(editType=="select"){
            var html = ["<select style='width:60px'>"], selected = '';
            for(var i in this.selectData) {
                selected = i == value ? 'selected' : '';
                html.push("<option value='" + i + "'" + selected + ">" + this.selectData[i] + "</option>");
            }
            html.push("</select>");
            return html.join(" ");
        }
    }
    this.saveValue = funSaveValue;//获取保存数据库的值
    function funSaveValue(value){
        if(this.showType==""){return value;}
        else if(this.showType=="time"){return value;}
        else if(this.showType=="chu1k"){return value * 1000;}
        else if(this.showType=="cheng1k"){return parseInt(value) / 1000;}
        else if(this.showType=="chu60"){return value * 60;}
        else if(this.showType=="cheng60"){return parseInt(value) / 60;}
        else if(this.showType=="chu1b"){return value * 100;}
        else if(this.showType=="cheng1b"){return parseInt(value) / 100;}
        else if(this.showType=="select"){return selectData[value];}
    }
}

//初始化表头
function initTab(){
	var divHtml = "<div id='tab_div'></div>";
	$(document.body).append(divHtml);
    var tabHtml = "<table id='main_tab' class='hovertable' width='100%'>";
    tabHtml += "<thead><tr id='tab_title_tr'>";
    for(var i=0; i<fieldArray.length; i++){
        tabHtml += "<th style='width: "+fieldArray[i].colWidth+"'>"+fieldArray[i].fieldDesc+"</th>";
    }
    tabHtml += "<th style='width: 80px'>操<a href='javascript:void(0);' onclick='addData()'>+</a>作</th></tr>";
    tabHtml += "</thead><tbody id='tab_body'></tbody></table>";
    $("#tab_div").html(tabHtml);
}
//增加新数据
function addData(){
    var tr="<tr>";
    for(var i=0; i<fieldArray.length; i++){
        tr += "<input type='hidden' name='"+fieldArray[i].field+"' value=''/>";
        tr += "<td name='"+fieldArray[i].field+"'>"+fieldArray[i].add()+"</td>";
    }
    tr += "<td><a href='javascript:void(0);' onclick='saveData(this,1)'>保存</a>&nbsp;&nbsp;<a href='javascript:void(0);' onclick='cancelAddData(this)'>取消</a></td>";
    $("#tab_body").append(tr);
}
//查询
function queryData(){
    $.ajax({
        type : "post",
//         data : {'city' : city},
        dataType : "json",
        async : false,
        url : urlArray['query'],
        success : function(data) {
            if(data.ret_code == 200) {
                $("#tab_body").empty();
                $.each(data.result,function(k,v){
                    var tr="<tr>";
                    for(var i=0; i<fieldArray.length; i++){
                        tr += "<input type='hidden' name='"+fieldArray[i].field+"' value='"+v[fieldArray[i].field]+"'/>";
                        tr += "<td name='"+fieldArray[i].field+"'>"+fieldArray[i].show(v[fieldArray[i].field])+"</td>";
                    }
                    tr += "<td><a href='javascript:void(0);' onclick='editData(this)'>编辑</a></td></tr>";
                    $("#tab_body").append(tr);
                });
                addDataClass();
            } else {
                alert("查询失败:"+data.ret_msg);
            }
        },
        error:function(err){
            alert("网络错误");
        }
    }); 
}
//将行转换成编辑状态
function editData(obj){
    var tr = $(obj).parent().parent();
    for(var i=0; i<fieldArray.length; i++){
        var value = tr.find("input[name='"+fieldArray[i].field+"']").val();
        tr.find("td[name='"+fieldArray[i].field+"']").html(fieldArray[i].edit(value));
    }
    tr.find("td:last").html("<a href='javascript:void(0);' onclick='saveData(this,2)'>保存</a>&nbsp;&nbsp;<a href='javascript:void(0);' onclick='cancelData(this)'>取消</a>");
}
//保存功能
function saveData(obj,type){//type:1增加,2修改
    var tr = $(obj).parent().parent();
    var data="{";
    for(var i=0; i<fieldArray.length; i++){
        var value = "";
        if(!fieldArray[i].canEdit){//不能编辑
            if(type==1)continue;//增加时，不能编辑的字段不封装
            value = tr.find("td[name='"+fieldArray[i].field+"']").html();
        }else if(fieldArray[i].editType=="" ||fieldArray[i].editType=="input"){
            value = tr.find("td:eq("+i+")>input:eq(0)").val();
            value = fieldArray[i].saveValue(value);
        }else if(fieldArray[i].editType=="select"){
            value = tr.find("td:eq("+i+")>select:eq(0)").val();
        }
        if(data!="{"){data+=","}
        data += fieldArray[i].field+":'"+value+"'";
    }
    data += "}";
    var url = (type==1)?urlArray['save']:urlArray['update'];
    $.ajax({
        type : "post",
        data : eval("(" +data+ ")"),
        dataType : "json",
        async : false,
        url : url,
        success : function(data) {
            if(data.ret_code == 200) {
                (type==1)?window.location.reload():backData(obj,"save");
            } else {
                alert("保存失败:"+data.ret_msg);(type==1)?cancelAddData(obj):cancelData(obj);
            }
        },
        error:function(err){
            alert("网络错误");(type==1)?cancelAddData(obj):cancelData(obj);
        }
    }); 
}
function cancelData(obj){
    backData(obj,"cancel");
}
function cancelAddData(obj){
    $(obj).parent().parent().remove();
}
function clearNoNum(obj)
{
    obj.value = obj.value.replace(/[^\d.]/g,"");
    obj.value = obj.value.replace(/^\./g,"");
    obj.value = obj.value.replace(/\.{2,}/g,".");
    obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
}
function backData(obj,type){
    var tr = $(obj).parent().parent();
    for(var i=0; i<fieldArray.length; i++){
        var value = "";
        if(type=="save"){
            if(!fieldArray[i].canEdit){//不能编辑
            	value = tr.find("input[name='"+fieldArray[i].field+"']").val();
            }else if(fieldArray[i].editType=="" ||fieldArray[i].editType=="input"){
                value = tr.find("td:eq("+i+")>input:eq(0)").val();
                value = fieldArray[i].saveValue(value);
            }else if(fieldArray[i].editType=="select"){
                value = tr.find("td:eq("+i+")>select:eq(0)").val();
            }
            tr.find("input[name='"+fieldArray[i].field+"']").val(value);
        }else{
            value = tr.find("input[name='"+fieldArray[i].field+"']").val();
        }
        tr.find("td[name='"+fieldArray[i].field+"']").html(fieldArray[i].show(value));
    }
    tr.find("td:last").html("<a href='javascript:void(0);' onclick='editData(this)'>编辑</a>");
    addDataClass();
}
function addDataClass(){//增加删除样式
    $("#tab_body").find("tr").each(function(i,v){
        var length = $(this).find("td").size();
        if($(this).find("input[name='test_status']").val()=="-1"){
           $(this).find("td:lt("+(length-1)+")").css({'text-decoration' : "line-through",'color' : 'red'});
        }else{
           $(this).find("td:lt("+(length-1)+")").css({'text-decoration' : "none",'color' : 'black'});
        }
    });
}