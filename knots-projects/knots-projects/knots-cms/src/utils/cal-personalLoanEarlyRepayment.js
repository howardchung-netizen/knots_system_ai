function entera(){
	if (event.keyCode==13){
		calculateResult();
	}
}

if(top.location.href.indexOf('/tc/')>0){
	var msg1 = "請輸入貸款額";
		var msg2 = "貸款額必須為數字及正數值";
			var msg3 = "貸款額必須為HK$10,000至HK$3,000,000之間";
				var msg4 = "請輸入每月平息";
					var msg5 = "每月平息必須為數字及正數值";
						var msg6 = "每月平息必須為0%至2%之間";
							var msg7 = "請輸入總手續費";
								var msg8 = "總手續費必須為數字及正數值";
									var msg9 = "總手續費必須為0%至12%之間";
										var msg10 = "請輸入提早償還貸款費用";
											var msg11 = "提早償還貸款費用必須為數字及正數值";
												var msg12 = "提早償還貸款費用必須為0%至5%之間";
													var msg13 = "提早償還貸款費用必須為HK$0至HK$2,000之間";
														var msgT = "輸入有錯，請重新輸入";
}else if(top.location.href.indexOf('/en/')>0){
	var msg1 = "Please input the Loan Amount";
		var msg2 = "Loan amount must be numeric";
			var msg3 = "The Loan Amount should be between HK$10,000 and HK$3,000,000";
				var msg4 = "Please input the Monthly Flat Rate";
					var msg5 = "Monthly Flat Rate must be numeric";
						var msg6 = "Monthly Flat Rate should be between 0% and 2%";
							var msg7 = "Please input the Total Handing Fee";
								var msg8 = "Total Handing Fee must be in numeric and positive values";
									var msg9 = "Total Handing Fee should be between 0% and 12%";
										var msg10 = "Please input the Early Repayment Charge";
											var msg11 = "Early Repayment Charge must be in numeric and positive values";
												var msg12 = "Early Repayment Charge should be between 0% and 5%";
													var msg13 = "Early Repayment Charge should be between HK$0 and HK$2,000";
														var msgT = "Input Error. Please input again";
}
var isEarlyValid;
function validCalculator(){

	var isValid = true;
	isEarlyValid = true;

	$('#balanceErrMsg').text('');
	$('#rateErrMsg').text('');
	$('#feeErrMsg').text('');
	$('#earlyErrMsg').text('');
	$('#earlyErrMsg1').text('');
	$('#earlyErrMsg2').text('');
	$('#earlyErrMsg3').text('');
	$('#topErrMsg').text('');
	// removeErrmsg(document.getElementById('balance'));
	// removeErrmsg(document.getElementById('rate'));

	// var balance = $('#balance').val().trim();

	if ($('#balance').val().trim() == '') {
		isValid = false;
		$('#balance').text(msg1);
		$('#balanceErrMsg').text(msg1);
	}else{
		if(!$.isNumeric($('#balance').val().trim())){
			isValid = false;
			$('#balanceErrMsg').text(msg2);
		}
		else if($('#balance').val().trim() < 10000 || $('#balance').val().trim() > 3000000){
			isValid = false;
			$('#balanceErrMsg').text(msg3);
		}
	}
	
		if ($('#rate').val().trim() == '') {
		isValid = false;
		$('#rateErrMsg').text(msg4);
	}else{
		if(!$.isNumeric($('#rate').val().trim())){
			isValid = false;
			$('#rateErrMsg').text(msg5);
		}
		else if($('#rate').val().trim() < 0 || $('#rate').val().trim() > 2){
			isValid = false;
			$('#rateErrMsg').text(msg6);
		}
	}

	if ($('#tf').val().trim() == '') {
		isValid = false;
		$('#feeErrMsg').text(msg7);
	}else{
		if(!$.isNumeric($('#tf').val().trim())){
			isValid = false;
			$('#feeErrMsg').text(msg8);
		}
		else if($('#tf').val().trim() < 0 || $('#tf').val().trim() > 12){
			isValid = false;
			$('#feeErrMsg').text(msg9);
		}
	}

	if($('#earlyRate').val().trim() == '' && $('#earlyCharge').val().trim() == '') {
		isEarlyValid = false;
		//$('#earlyErrMsg').text(msg10);
	}
	else {
		if($('#earlyRate').val().trim() != '') {
			if(!$.isNumeric($('#earlyRate').val().trim())) {
				isValid = false;
				$('#earlyErrMsg1').text(msg11);
			}
			else if($('#earlyRate').val().trim() < 0 || $('#earlyRate').val().trim() > 5) {
				isValid = false;
				$('#earlyErrMsg2').text(msg12);
			}
		}
		if($('#earlyCharge').val().trim() != '') {
			if(!$.isNumeric($('#earlyCharge').val().trim())) {
				isValid = false;
				$('#earlyErrMsg1').text(msg11);
			}
			else if($('#earlyCharge').val().trim() < 0 || $('#earlyCharge').val().trim() > 2000) {
				isValid = false;
				$('#earlyErrMsg3').text(msg13);
			}
		}
		else {
			isValid = false;
			$('#earlyErrMsg').text(msg10);
		}
	}

	if(!isValid) {
		$('#topErrMsg').text(msgT);
		$('#topErrMsg').focus();
	}

	return isValid;

}

function Disablebox() {
  var category = document.getElementById('op');
  if (document.getElementById('rate').value == 0 && document.getElementById('tf').value == 0)
  {	  
  document.getElementById('op').disabled = true;
  category.value = 'op1';
  }
  else if (document.getElementById('rate').value > 0 && document.getElementById('tf').value == 0){
  document.getElementById('op').disabled = false;
  }
  else if (document.getElementById('rate').value == 0 && document.getElementById('tf').value > 0){
  document.getElementById('op').disabled = true;
  category.value = 'op1';
  }
  else{
  document.getElementById('op').disabled = false;
  }
}

function Cal3(){
	var balance = document.getElementById('balance').value;
	var rate = document.getElementById('rate').value;
	var mth = document.getElementById('mth').value;
	var tf = document.getElementById('tf').value;
	var op = document.getElementById('op').value;
	var earlyCharge = document.getElementById('earlyCharge').value;
	var earlyRate = document.getElementById('earlyRate').value;

	var earlyChargeLarger = (balance*earlyRate*0.01 > earlyCharge) ? balance*earlyRate*0.01: earlyCharge;
	
	$('#result-data').empty();

	// Handling Fee By installment
	var mthInstalment = 0;
	if (op == 'op1')
	{
		var mthInstalment = balance * (rate * 0.01) + balance/mth;
	}
	else
	{
		var mthInstalment = (balance * (1 + tf * 0.01) * (1 + mth * rate * 0.01))/mth;
	}


	var ttlFee = balance * tf * 0.01;
	// (1 + annual rate)(1 / # of periods) � 1
	var apr = calAPR(balance, mthInstalment, mth);

	var osbal = balance;

	// User Parameter
	$('#resultLoan').text(roundAmount(balance));
	$('#resultRate').text(rate);
	$('#resultTenor').text(mth);
	$('#resultFeePer').text(tf);
	$('#resultFee').text(roundAmount(ttlFee));
	$('#resultInstalment').text(roundAmount(mthInstalment));
	$('#resultEarlyCharge').text(roundAmount(earlyChargeLarger));
	
	// row 0
	// $('#resultTable tr:last .gridInstalmentNo').text(0);
	// $('#resultTable tr:last .gridOutstanding').text(roundAmount(balance));

	// $('#resultTable tr.clone').remove();
	var breakEvenMthInstalment=-1;
	
	var prevAccumulatedInterestSaving=0;
	var prevEarlyRepaymentCharge=0;
	
	for (i = 0; i < mth; i++) {
		var interest = osbal * apr;
		var principal = mthInstalment - interest;
		var earlyRepaymentCharge = earlyCharge;
		var earlyRepaymentChargeTemp=osbal*earlyRate* 0.01;
		
		if (Number(earlyRepaymentChargeTemp) > Number(earlyRepaymentCharge) ) {
			earlyRepaymentCharge=earlyRepaymentChargeTemp;
		} else {
		}
		osbal = osbal - principal;

		var accumulatedInterestSaving=0;
		var principalTmp=principal;
		var mthInstalmentTmp=mthInstalment;
		var interestTmp=interest;
		var osbalTmp=osbal;
		var count=0;
		
		for (j=i+1;j<mth;j++) {
			count++;
			var interestTmp = osbalTmp * apr;
			var principalTmp = mthInstalmentTmp - interestTmp;
			osbalTmp = osbalTmp - principalTmp;
			accumulatedInterestSaving = accumulatedInterestSaving + interestTmp;
		}


		var appendString = '<tr>';
		appendString += '<td><b>'+(i+1)+'</b></td>';
		appendString += '<td class="color-blue">'+roundAmount(mthInstalment)+'</td>';
		appendString += '<td class="color-blue">'+roundAmount(interest)+'</td>';
		appendString += '<td class="color-blue">'+roundAmount(principal)+'</td>';
		appendString += '<td class="color-blue">'+roundAmount(osbal)+'</td>';
		//appendString += '<td class="color-blue">'+roundAmount(accumulatedInterestSaving)+'</td>';
		//appendString += '<td class="color-blue">'+roundAmount(earlyRepaymentCharge)+'</td>';
		appendString += '</tr>';
		$('#result-data').append(appendString);

		// if (prevAccumulatedInterestSaving > prevEarlyRepaymentCharge && earlyRepaymentCharge > accumulatedInterestSaving ) {
		// 	breakEvenMthInstalment=i+1;
		// }
		if (accumulatedInterestSaving > earlyRepaymentCharge) {
			breakEvenMthInstalment=i+1;
		}
		
		prevAccumulatedInterestSaving=accumulatedInterestSaving;
		prevEarlyRepaymentCharge=earlyRepaymentCharge;
		
		/*
		// Clone table row and
		var $tr = $('#resultTable tr:last').clone();
		$tr.removeClass('template').addClass('clone')
		$('#resultTable tr:last').after($tr[0].outerHTML);

		$('#resultTable tr:last .gridInstalmentNo').text(i+1);
		$('#resultTable tr:last .gridInstalmentAmt').text(roundAmount(mthInstalment));
		$('#resultTable tr:last .gridInterest').text(roundAmount(interest));
		$('#resultTable tr:last .gridPrincipal').text(roundAmount(principal));
		$('#resultTable tr:last .gridOutstanding').text(roundAmount(osbal));
		*/
	}
    
    if (isEarlyValid == false) {
        $('#resultEarlyChargeSection').hide();
        $('#earlyBreakEvenMessage').html('');
	}
	else {
        $('#resultEarlyChargeSection').show();
        $('#earlyBreakEvenMessage').html(getEarlyBreakEvenMessage(breakEvenMthInstalment));
	}
	
}

function roundAmount(amount){
	return addCommas(parseFloat(Math.round(amount* 100) / 100).toFixed(2));
}

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

// Effective APR for P+I Calculation (Monthly)
function calAPR(balance, mthInstalment, mth)
{
	var apr = 0.0000001;
	var difference = 1;
	var amountToAdd = 1;

	while (difference != 0)
	{
		difference = ((apr * balance) / (1 - Math.pow(1 + apr, -mth))) - mthInstalment;
		if (difference <= 0.0000001 && difference >= -0.0000001)
		{
			break;
		}
				if (difference > 0)
				{
					amountToAdd = amountToAdd / 2;
					apr= apr - amountToAdd;
				}
				else
				{
					amountToAdd = amountToAdd * 2;
					apr = apr + amountToAdd;
				}
	}
	return apr;
}

function calculateResult(){
	
	//$('#cal-result').fadeIn(1000);
	//$('#print-btn').show();
	
	
	$('#cal-result').hide();
	$('#print-btn').hide();

	if(validCalculator()){

		Cal3();
		$('#cal-result').fadeIn(1000);
		$('#print-btn').show();

	}
	
}

function resetAll(){
	$('#cal-result').hide();
	$('#print-btn').hide();
	$('#balance').val('');
	$('#rate').val('');
	$('#tf').val('');
	$('#earlyRate').val('');
	$('#earlyCharge').val('');
	$('#balanceErrMsg').text('');
	$('#rateErrMsg').text('');
	$('#feeErrMsg').text('');
	$('#earlyErrMsg').text('');
	$('#earlyErrMsg1').text('');
	$('#earlyErrMsg2').text('');
	$('#earlyErrMsg3').text('');
	$('#topErrMsg').text('');
}