import React, { useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QUOTATION_CREATE, QUOTATION_MARKUP_UPDATE, QUOTATION_UPDATE } from '../../apollo/mutations';
import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import Input from '../Input';
import { Divider, InputAdornment } from '@mui/material';
import { toMoney } from '../../utils';
import language from '../../localization/language';
import { t, use } from 'i18next';
import { set } from 'date-fns';
import ConfirmModal from '../ConfirmModal';
import BackdropLoading from '../BackdropLoading';

const updateMarkupForm = (form) => {
  let f = [];
  form.forEach(item => {
    let child = [];
    let newItem = {...item};
    if(newItem?.price?.newUnitPrice) {
        if(!newItem.price?.base) newItem.price.base = item.price.value;
        newItem.price.value = newItem?.price?.newUnitPrice;
        newItem.price.newUnitPrice = undefined;
    }
    if(newItem?.price?.newTotalAmount) {
        newItem.price.amount = newItem?.price?.newTotalAmount;
        newItem.price.newTotalAmount = undefined;
    }
    if(item?.child?.length) child = updateMarkupForm(item.child);
    newItem.child = child;
    f.push(newItem);
  })
  return f
}

export default ({defaultMarkup, markup, onMarkupChange, onMarkupChangeCancel, editAt, form}) => {

	const { quotationId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = React.useState({
		markup: defaultMarkup
	});
  const [inputError, setInputError] = React.useState({});
	const [isMarkupChange, setIsMarkupChange] = React.useState(false);
  const [isPreview, setIsPreview] = React.useState(false);
  const [formDataCreateMutate, createStatus] = useMutation(QUOTATION_CREATE);
  const [formDataUpdateMutate, updateStatus] = useMutation(QUOTATION_MARKUP_UPDATE);
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
			...newData
		});
  }

	const checkInputError = () => {
    let inputError = {};
    for (let i of ["markup"]) {
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
					form: updateMarkupForm(form),
          markup: parseFloat(markup),
          editAt: editAt,
         }
      },
      onCompleted: (res) => {
        if (res.quotationMarkupUpdate.userErrors.length) {
          res.quotationMarkupUpdate.userErrors.map(e => {
            enqueueSnackbar(e.message, {
              variant: 'error'
            })
          })
        }
        else if (res.quotationMarkupUpdate.quotation) {
          enqueueSnackbar(`編輯成功`, {
            variant: 'success'
          })
					setIsMarkupChange(false);
          setIsPreview(false);
          enableInput()
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

  const enableInput = () => { 
    let ratioDiscountInput = document.getElementById('ratioDiscountInput');
    let discountRatioInput = document.getElementById('discountRatioInput');
    if(ratioDiscountInput) ratioDiscountInput.disabled = false;
    if(discountRatioInput) discountRatioInput.disabled = false;
  }

  const disableInput = () => {
    let ratioDiscountInput = document.getElementById('ratioDiscountInput');
    let discountRatioInput = document.getElementById('discountRatioInput');
    if(ratioDiscountInput) ratioDiscountInput.disabled = true;
    if(discountRatioInput) discountRatioInput.disabled = true;
  
  }

	useLayoutEffect(() => {
		setFormData({	
			markup: markup
		})
	}, [markup])

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
					單價調整:
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'center' }}>
					<Input
							style={{ height: '100%', width: '100%', textAlign: 'center', justifyContent: 'center' }}
              id="markupInput"
							type="number"
							variant="standard"
							InputProps={{
								inputProps: { 
									min: 0,
									style: { textAlign: "right" },
								 },
								endAdornment: <InputAdornment position="start">%</InputAdornment>,
							}}
							value={formData.markup}
							error={inputError.markup}
							helperText={inputError.markup}
              onFocus={(e) => {
                disableInput()
              }}
              onBlur={(e) => {
                if(defaultMarkup !== formData.markup) return;
                enableInput()
              }}
							onChange={(e) => {
								setIsMarkupChange(true);
                setIsPreview(false);
								onFormDataChange(['markup'], [e.target.value]);
							}}
						/>
					</div>
					<div className="tree-cell" style={{ minWidth: 150, maxWidth: 150, justifyContent: 'center' }}>
					{isMarkupChange && <button
							style={{ color: 'white', backgroundColor: 'orange', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
							onClick={(e) => {
								if(onMarkupChange) onMarkupChange(formData.markup);
                setIsPreview(true);
								e.stopPropagation();
								e.preventDefault();
						}}>預覽</button>}
					</div>
					<div className="tree-cell" style={{ fontWeight: 'bold', textAlign: 'center', width: 50, minWidth: 40 }}>
					</div>
					<div className="tree-cell-action" style={{ minWidth: 150, display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
					{isMarkupChange && <button
					style={{color: 'rgb(33, 150, 243)', backgroundColor: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'}} 
					onClick={() => {
						  setIsMarkupChange(false);
              setIsPreview(false);
              setFormData({	
                markup: defaultMarkup
              })
							if(onMarkupChangeCancel) onMarkupChangeCancel(defaultMarkup);
					}}>取消</button>}
					{isPreview && <button 
					style={{color: 'white', backgroundColor: 'rgb(33, 150, 243)', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'}}
					onClick={(e) => {
						 e.stopPropagation();
						 e.preventDefault();
						 handleMyConfirmModalOpen('確定儲存?', '', _onConfirmClick)
					}}>儲存</button>}
					</div>
				</div>
			</li>
		</>
	)
}