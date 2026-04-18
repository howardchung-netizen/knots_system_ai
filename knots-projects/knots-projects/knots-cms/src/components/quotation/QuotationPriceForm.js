import React, { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QUOTATION_CREATE, QUOTATION_UPDATE } from '../../apollo/mutations';
import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import Input from '../Input';
import { Divider, InputAdornment } from '@mui/material';
import { toMoney } from '../../utils';
import language from '../../localization/language';
import ConfirmModal from '../ConfirmModal';
import BackdropLoading from '../BackdropLoading';

function calculateTotalPrice(items) {
  let totalPrice = 0;

  for (const item of items) {
    if (item.child?.length > 0) {
      totalPrice += calculateTotalPrice(item.child);
    }

    if (item.price) {
      totalPrice += item.price.value * item.price.quantity;
    }
  }

  return totalPrice;
}

function calculateTotalAmount(items) {
  let totalAmount = 0;
  for (const item of items) {
    if (item.child !==undefined && item.child?.length > 0) {
      totalAmount += calculateTotalAmount(item.child);
    }

    if (item.price) {
      totalAmount += item.price.value * item.price.quantity;
    }
  }

  return totalAmount
}

function calculateDiscountRatio(total, ratioDiscount) {
return (ratioDiscount / total) * 100;
}

function calculateRatioDiscount (totalAmount, discountRatio) { 
  return Math.ceil(totalAmount - (totalAmount * (1 - (discountRatio / 100))));
}

function calculateGrandTotal(totalAmount, ratioDiscount, discount) { 
  return totalAmount - ratioDiscount - discount;
}

export default ({discount, ratioDiscount, discountRatio, totalAmount, grandTotal, canUpdateDiscount}) => {

	const { quotationId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({
		discount: discount,
		ratioDiscount: ratioDiscount,
		discountRatio: discountRatio,
		grandTotal: grandTotal,
		totalAmount: totalAmount
	});
  const [inputError, setInputError] = React.useState({});
	const [isDiscountRatioChange, setIsDiscountRatioChange] = React.useState(false);
	const [isDiscountChange, setIsDiscountChange] = React.useState(false);
	const isTotalAmountChange = formData.totalAmount !== totalAmount;
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_UPDATE);
  const [myConfirmModalOpen, setMyConfirmModalOpen] = React.useState({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
  });
  
  const handleMyConfirmModalOpen = (title, content, onConfirm) => setMyConfirmModalOpen({
    open: true,
    title: title,
    content: content,
    onConfirm: onConfirm,
    onClose: handleMyConfirmModalClose
  });

  const handleMyConfirmModalClose = () => setMyConfirmModalOpen({
    open: false,
    title: null,
    content: null,
    onConfirm: ()=>{},
    onClose: handleMyConfirmModalClose
  });

	const onFormDataChange= (key, value) => {
    let data = {};
    let _inputError = inputError;
    for (let i in key) {
      data[key[i]] = value[i] === '' ? null : value[i];
      _inputError[key[i]] = null;
      setInputError(_inputError);
    }

		let newData = {...formData, ...data};
		setFormData({
			...newData,
			ratioDiscount: calculateRatioDiscount(newData.totalAmount, newData.discountRatio),
			grandTotal: calculateGrandTotal(newData.totalAmount, calculateRatioDiscount(newData.totalAmount, newData.discountRatio), newData.discount)
		});
  }

	const checkInputError = () => {
    let inputError = {};
    for (let i of ["discount", "ratioDiscount", "discountRatio", "grandTotal"]) {
      if (formData[i] === null || formData[i] === undefined) inputError[i] = language.inputError.required;
    }
    setInputError(inputError);
    
    let hasError = Object.keys(inputError).length;

    return hasError
  }
  
  const _onConfirmClick = () => {
    if (checkInputError()) {
      enqueueSnackbar('請檢查輸入', {
        variant: 'error'
      })
      return;
    } else formDataUpdateMutate({
      variables: {
        data: { 
          id: quotationId,
					...formData
         }
      },
      onCompleted: (res) => {
        if (res.quotationUpdate.userErrors.length) {
          res.quotationUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationUpdate.quotation) {
          enqueueSnackbar(`編輯成功`, {
            variant: 'success'
          })
					setIsDiscountChange(false);
					setIsDiscountRatioChange(false);
					let markupInput = document.getElementById('markupInput');
					markupInput.disabled = false;
					handleMyConfirmModalClose()
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
        return;
      }
    })
    
  }

	useLayoutEffect(() => {
		setFormData({	
			discount: discount,
			ratioDiscount: ratioDiscount,
			discountRatio: discountRatio,
			grandTotal: grandTotal,
			totalAmount: totalAmount
		})
	}, [discount, ratioDiscount, discountRatio, grandTotal, totalAmount])

	return (
		<>
		  {(createStatus.loading || updateStatus.loading) && <BackdropLoading />}
			<ConfirmModal
				mode={'confirm'}
				open={myConfirmModalOpen.open}
				title={myConfirmModalOpen.title}
				content={myConfirmModalOpen.content}
				onCloseClick={myConfirmModalOpen.onClose}
				onConfirmClick={myConfirmModalOpen.onConfirm}
			/>
			<li className="tree-item cursor-default" >
				<div className="tree-row">
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', minWidth: 386 }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, justifyContent: 'right' }}>
					合計:
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, fontWeight: 'bold', textAlign: 'center' }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between' }}>
						<div>HK$</div>
						<div>
							<Input
								id="totalAmountInput"
							  className="noArrow"
								style={{ height: '100%', width: '100%', textAlign: 'center' }}
								type="number"
								variant="standard"
								InputProps={{
									inputProps: { 
										min: 0,
										style: { textAlign: "right" },
									 },
								}}
								value={formData.totalAmount}
								onFocus={(e) => {
									let markupInput = document.getElementById('markupInput');
									markupInput.disabled = true;
								}}
								onBlur={(e) => {
									if(formData.ratioDiscount !== ratioDiscount) return;
									let markupInput = document.getElementById('markupInput');
									markupInput.disabled = false;
								}}
								onChange={(e) => {
									let totalAmount = isNaN(e.target.value) ? null : parseInt(e.target.value);
									setIsDiscountRatioChange(e.target.value != discountRatio);
									onFormDataChange(["totalAmount"], [totalAmount]);
								}}
							/>
						</div>
					</div>
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: 50, minWidth: 40 }}>
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150, maxWidth: 150}}>
					</div>
				</div>
			</li>
			<Divider />
			<li className="tree-item cursor-default" >
				<div className="tree-row">
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', minWidth: 386 }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, justifyContent: 'right' }}>
					  折扣:
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'center' }}>
						<Input
						  id="discountRatioInput"
							style={{ height: '100%', width: '100%', textAlign: 'center', justifyContent: 'center' }}
							type="number"
							variant="standard"
							InputProps={{
								inputProps: { 
									min: 0,
									style: { textAlign: "right" },
								 },
								endAdornment: <InputAdornment position="start">%</InputAdornment>,
							}}
							value={formData.discountRatio}
							error={inputError.discountRatio}
							helperText={inputError.discountRatio}
							onFocus={(e) => {
								let markupInput = document.getElementById('markupInput');
								markupInput.disabled = true;
							}}
							onBlur={(e) => {
								if(formData.ratioDiscount !== ratioDiscount) return;
								let markupInput = document.getElementById('markupInput');
								markupInput.disabled = false;
							}}
							onChange={(e) => {
								setIsDiscountRatioChange(e.target.value != discountRatio);
								onFormDataChange(["discountRatio", ""], [e.target.value ? parseInt(e.target.value) : null]);
							}}
						/>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between' }}>
						<div>HK$</div>
						<div>
							<Input
								id="ratioDiscountInput"
							  className="noArrow"
								style={{ height: '100%', width: '100%', textAlign: 'center' }}
								type="number"
								variant="standard"
								InputProps={{
									inputProps: { 
										min: 0,
										style: { textAlign: "right" },
									 },
								}}
								value={formData.ratioDiscount}
								onFocus={(e) => {
									let markupInput = document.getElementById('markupInput');
									markupInput.disabled = true;
								}}
								onBlur={(e) => {
									if(formData.ratioDiscount !== ratioDiscount) return;
									let markupInput = document.getElementById('markupInput');
									markupInput.disabled = false;
								}}
								onChange={(e) => {
									let ratioDiscount = isNaN(e.target.value) ? null : parseInt(e.target.value);
									setIsDiscountRatioChange(e.target.value != discountRatio);
									onFormDataChange(["ratioDiscount", "discountRatio"], [ratioDiscount, calculateDiscountRatio(formData.totalAmount, ratioDiscount)]);
								}}
							/>
						</div>
					</div>
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: 50, minWidth: 40 }}>
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150 }}>
					</div>
				</div>
			</li>
			<Divider />
			<li className="tree-item cursor-default"  style={{display: 'none'}}>
				<div className="tree-row">
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', minWidth: 386  }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, justifyContent: 'right' }}>
					Discount:
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, textAlign: 'center' }}>
					<Input
							style={{ height: '100%', width: '100%', textAlign: 'center' }}
							type="number"
							variant="standard"
							InputProps={{
								inputProps: { min: 0 }
							}}
							value={formData.discount}
							error={inputError.discount}
							helperText={inputError.discount}
							onChange={(e) => {
								setIsDiscountChange(e.target.value != discount);
								onFormDataChange(["discount"], [e.target.value ? parseInt(e.target.value) : null]);
							}}
						/>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'space-between' }}>
					  <div>HK$</div>
						<div>{toMoney(formData.discount)}</div>
					</div>
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: 50, minWidth: 40 }}>
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150}}>
					</div>
				</div>
			</li>
			<Divider />
			<li className="tree-item cursor-default" >
				<div className="tree-row">
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: '100%', minWidth: 386  }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 160, maxWidth: 160, fontWeight: 'bold', justifyContent: 'right' }}>
					<strong>收取金額:</strong>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, fontWeight: 'bold', textAlign: 'center' }}>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, fontWeight: 'bold', justifyContent: 'space-between' }}>
						<div>HK$</div>
						<div>{toMoney(formData.grandTotal)}</div>
					</div>
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: 50, minWidth: 40 }}>
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150, display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
					{(isDiscountRatioChange || isDiscountChange || isTotalAmountChange) && <button
					style={{color: 'rgb(33, 150, 243)', backgroundColor: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'}} 
					onClick={() => {
						  let markupInput = document.getElementById('markupInput');
							markupInput.disabled = false;
						  setIsDiscountChange(false);
							setIsDiscountRatioChange(false);
							setFormData({
								discount: discount,
								ratioDiscount: ratioDiscount,
								discountRatio: discountRatio,
								grandTotal: grandTotal,
								totalAmount: totalAmount
							})
					}}>取消</button>}
					{(isDiscountRatioChange || isDiscountChange || isTotalAmountChange) && <button 
					style={{color: 'white', backgroundColor: 'rgb(33, 150, 243)', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'}}
					onClick={(e) => {
						 e.stopPropagation();
						 e.preventDefault();
						 if (canUpdateDiscount === false) {
							alert('已有項目在發票單中，無法修改折扣!');
							return;
						}
						else handleMyConfirmModalOpen('確定儲存?', '', _onConfirmClick)
					}}>儲存</button>}
					</div>
				</div>
			</li>
		</>
	)
}