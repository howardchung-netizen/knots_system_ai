import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { ComponentToPrint } from '../components/ComponentToPrint';
import { Button, Checkbox, Divider, FormControlLabel, FormGroup, Stack, TextareaAutosize } from '@mui/material';
import { useParams } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import language from '../localization/language';
import BackdropLoading from '../components/BackdropLoading';
import moment from 'moment';
import { UserContext } from '../contexts/UserContext';
import { addLineBreaks, calculateElementHeight, toMoney } from '../utils';
import logo from '../assets/logo/knots_logo.png';
import companyInfo from '../constants/companyInfo';
import { quotationsQuery } from '../apollo/queries';
import { quotationFragment } from '../apollo/fragments';
import _ from 'underscore';

const REACT_APP_DEFAULT_COMPANY = process.env.REACT_APP_DEFAULT_COMPANY;
const signture = require('../../src/assets/logo/knots_signture.png');

const itemListMaxHeight = 850;
const termListContainerMaxHeight = 850;
const termListMaxHeight = 815;
const termTitleHeight = 34;
const contentMaxWidth = 476.7;
const itemPagePriceBlockHeight = 140;
const signtureBlockHeight = 97;
const defaultHeaderFontSize = 12;
const defaultUpperNameFontSize = 13;
const defaultLowerNameFontSize = 12;
const defaultUpperDescFontSize = 11;
const defaultLowerDescFontSize = 11;
const footerHeight = 31 + 14;
const defaultItemFontSize = 15;
const defaultTermFontSize = 13;
const defaultRemarkFontSize = 13;
const defaultRowPadding = 8
const defaultRowPaddingBottom = 5;
const defaultRowPaddingTop = 5;
const defaultTermPaddingBottom = 5;
const defaultSessionHeight = 10;
const defaultTableHeaderHeight = 22;
const defaultCompanySignatureSize = "19mm";
const fontFamily = 'Arial';
const baseTdStyle = { borderRight: '1px solid black', borderLeft: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' };

export default () => {

  const queryParameters = new URLSearchParams(window.location.search)
  const [localLang, srtLocaLang] = React.useState('zh-hk');
  const [dataKeyLang, setDataKeyLang] = React.useState('Cht');
  const [dataLang, setDataLang] = React.useState('cht');
  const [showItemDesc, setShowItemDesc] = React.useState(false);
  const [showPriceAndUnit, setShowPriceAndUnit] = React.useState(true);
  const [showUnitPrice, setShowUnitPrice] = React.useState(true);
  const [showSignature, setShowSignature] = React.useState(true);
  const [showSession, setShowSession] = React.useState(true);
  const componentRef = React.useRef();
  const { quotationId } = useParams();
  const [user, userDispatch] = React.useContext(UserContext);
  const [lang, setLang] = React.useState('cht');
  const [query, queryQuotation] = useLazyQuery(gql`${quotationsQuery} ${quotationFragment}`,
  {
    fetchPolicy: 'cache-first',
    variables: {
      id: quotationId,
      first: 1,
    },
    onCompleted: (res) => {  
      if(res.quotations.edges.length > 0) {
        let currentPageItemsHeight = 0;
        let numberOfPages = 0;
        let itemNumber = 0;
        let sessionPrice = 0;
        let pages = [[]];
        let terms = [[]];
        let q = res.quotations.edges[0].node;
        setQuotation(q)
        let qItems = JSON.parse(q.form)

        if (qItems) {
          const listQuotationItem = (qItems, index, parentVisibleCounter = 0) => {
            let visibleItemCounter = parentVisibleCounter; // 用於計算可見項目的編號
            qItems.forEach((e, i) => {
              let item = e;
              item.type = '0'
              sessionPrice += item.price?.amount ?? 0;
              
              // 只有當項目不是隱藏編號時才增加計數器
              if (!item.isHideNo) {
                visibleItemCounter++;
                item.itemNumber = index ? index + '.' + visibleItemCounter : visibleItemCounter;
              } else {
                item.itemNumber = ''; // 隱藏編號的項目設為空字符串
              }
              
              let rowHeight = calculateElementHeight(
                <DivHeight
                  index={item.itemNumber}
                  isHideNo={item.isHideNo}
                  isSession={item.isSession}
                  name={item['name_' + dataLang]}
                  desc={item['desc_' + dataLang]}
                  price={item.price?.value}
                  qty={item.price?.quantity}
                  unit={item.price?.['unit_' + dataLang]}
                  amount={item.price?.amount}
                  upper={item.upper}
                  child={[]}
                  isUpper={true}
                />
              );

              currentPageItemsHeight += rowHeight;
              if (pages[numberOfPages].length == 0) currentPageItemsHeight += defaultTableHeaderHeight;
              item.sumOfRowHeight = currentPageItemsHeight
              e.height = rowHeight;

              if ((item.upper != 0 && currentPageItemsHeight > itemListMaxHeight) || (item.upper == 0 && currentPageItemsHeight + 30 > itemListMaxHeight)) {
                numberOfPages += 1;
                e.sumOfRowHeight = rowHeight;
                pages.push([item]);
                currentPageItemsHeight = 0;
              }
              else {
                if (i == qItems.length - 1 && index == 0) item.isLastTypeItem = true;
                pages[numberOfPages].push(item);
              }

              if (e.child?.length) {
                // 傳遞父項目的編號給子項目，子項目從0開始計數
                const parentNumber = item.isHideNo ? '' : item.itemNumber;
                listQuotationItem(e.child, parentNumber, 0);
              }

              if (item.upper == 0) {
                let sessionItem = {
                  type: '0',
                  itemNumber: '',
                  isSession: true,
                  price: {
                    amount: showSession ? sessionPrice : '',
                    value: showSession ? `Sec. ${(i + 1)} Total` : ' ',
                  }
                }
                let rowHeight = calculateElementHeight(
                  <DivHeight
                    index={sessionItem.itemNumber}
                    isHideNo={sessionItem.isHideNo}
                    isSession={sessionItem.isSession}
                    name={sessionItem['name_' + dataLang]}
                    desc={sessionItem['desc_' + dataLang]}
                    price={sessionItem.price?.value}
                    qty={sessionItem.price?.quantity}
                    unit={sessionItem.price?.['unit_' + dataLang]}
                    amount={sessionItem.price?.amount}
                    upper={sessionItem.upper}
                    child={[]}
                    isUpper={true}
                  />
                );

                if(rowHeight < 34) rowHeight = 34;
                
                if (i == qItems.length - 1) sessionItem.isLastTypeItem = true;
                sessionItem.rowHeight = rowHeight;
                currentPageItemsHeight += rowHeight
                sessionItem.sumOfRowHeight = currentPageItemsHeight;
                pages[numberOfPages].push(sessionItem);
                sessionPrice = 0;
              }

            });
          }
          listQuotationItem(qItems, 0, 0);
        }
        if(q.remark){
          let rowHeight = calculateElementHeight(
            <RemarkBlock
              remark={q.remark}
            />
          );
          rowHeight += 15;
          currentPageItemsHeight += rowHeight;
          
          let item = {
            type: '1',
            remark: q.remark,
            rowHeight: rowHeight,
            sumOfRowHeight: currentPageItemsHeight
          }
          if (currentPageItemsHeight > itemListMaxHeight) {
            numberOfPages += 1;
            item.sumOfRowHeight = rowHeight;
            pages.push([item]);
            currentPageItemsHeight = rowHeight;
          }
          else {
            item.isLastTypeItem = true;
            pages[numberOfPages].push(item)
          }
        }
        if (q.client) {
          let client = q.client;
          let mainContact = q.mainContact;
          setClient({
            to: client['company' + dataKeyLang],
            attn: mainContact ? mainContact['name' + dataKeyLang] : '',
            email: client.email,
            address: client.address,
          })
        }
        if (q.term) {
          let _term = JSON.parse(q.term);
          if (!_term[0]);
          else _term.forEach((e, i) => {
            e.type = '2';
            e.itemNumber = i + 1;
            let rowHeight = calculateElementHeight(
              <TermDivHeight
                name={e['name_' + dataLang]}
                desc={e['desc_' + dataLang]}
              />
            );

            currentPageItemsHeight += rowHeight;
            e.sumOfRowHeight = currentPageItemsHeight
            e.height = rowHeight;

            if (currentPageItemsHeight + (i == 0 && pages[numberOfPages].find(e => e.type === "0") ? 100 : 0) > termListMaxHeight) {
              numberOfPages += 1;
              e.sumOfRowHeight = rowHeight;
              pages.push([e]);
              currentPageItemsHeight = rowHeight;
            }
            else if (i == _term.length - 1) {
              pages[numberOfPages].push(e)
              if (currentPageItemsHeight > termListMaxHeight) {
                terms.push([{ sumOfRowHeight: 0 }])
              };
            }
            else {
              if (i == e.length - 1) e.isLastTypeItem = true;
              pages[numberOfPages].push(e)
            }
          });
        }
        setPages(pages);
        console.log("pages", pages)
      }
      else {
        setQuotation(null);
        setClient(null);
        alert('Quotation not found');
        window.close();
      }
      
    },
    onError: (err) => {
      alert(err)
      window.close();
    }
  });

  const toDay = moment().format('Do MMM, YYYY');
  const [headerFontSize, setHeaderFontSize] = React.useState(defaultHeaderFontSize);
  const [termFontSize, setTermFontSize] = React.useState(localStorage.getItem('defaultTermFontSize') ? localStorage.getItem('defaultTermFontSize') : defaultTermFontSize);
  const [itemFontSize, setItemFontSize] = React.useState(localStorage.getItem('defaultItemFontSize') ? localStorage.getItem('defaultItemFontSize') : defaultItemFontSize);
  const [remarkFontSize, setRemarkFontSize] = React.useState(localStorage.getItem('defaultRemarkFontSize') ? localStorage.getItem('defaultRemarkFontSize') : defaultRemarkFontSize);
  const [companySignatureSize, setCompanySignatureSize] = React.useState(defaultCompanySignatureSize);
  const [sessionHeight, setSessionHeight] = React.useState(defaultSessionHeight);
  const [upperNameFontSize, setUpperNameFontSize] = React.useState(itemFontSize);
  const [lowerNameFontSize, setLowerNameFontSize] = React.useState(localStorage.getItem('defaultLowerNameFontSize') ? localStorage.getItem('defaultLowerNameFontSize') : itemFontSize - 1);
  const [upperDescFontSize, setUpperDescFontSize] = React.useState(localStorage.getItem('defaultUpperDescFontSize') ? localStorage.getItem('defaultUpperDescFontSize') : itemFontSize - 2);
  const [lowerDescFontSize, setLowerDescFontSize] = React.useState(localStorage.getItem('defaultLowerDescFontSize') ? localStorage.getItem('defaultLowerDescFontSize') : itemFontSize - 2);
  const [rowPadding, setRowPadding] = React.useState(defaultRowPadding);
  const [rowPaddingBottom, setRowPaddingBottom] = React.useState(defaultRowPaddingBottom);
  const [rowPaddingTop, setRowPaddingTop] = React.useState(defaultRowPaddingTop);
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [pages, setPages] = useState([]);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [term, setTerm] = useState([]);

  const DivHeight = ({ index, name, desc, price, qty, unit, amount, upper, isHideNo, isSession, child }) => {
    let isUpper = upper == 0;
    let backgroundColor = null;
    if (isSession && showSession) backgroundColor = '#ebebeb';
    else if (isUpper) backgroundColor = '#bcd7f3';
    else backgroundColor = 'white';
    let indexLength = 0;
    let indexWidth = 5;
    
    try {
      indexLength = index.split('.').length;
      if (indexLength >= 3) {
        indexWidth = indexLength * 5.5;
      }
      if (indexLength > 3) {
        indexWidth += 5;
      }
    } catch (error) {
    }
    
    return (
      <>
        <table style={{ width: '210mm', borderTop: '1px solid black', borderCollapse: 'collapse', fontSize: itemFontSize }}>
          <tbody>
            <tr style={{ fontWeight: 'bold', height: isSession ? sessionHeight : 'auto', fontFamily: fontFamily, fontSize: itemFontSize }}>
              <td style={{ ...baseTdStyle, verticalAlign: 'middle', backgroundColor: backgroundColor, width: 40, minWidth: 40, maxWidth: 40}}>{isHideNo ? '' : index}</td>
              <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', paddingLeft: indexWidth, paddingTop: rowPaddingTop, paddingBottom: rowPaddingBottom, backgroundColor: backgroundColor }}>
                <div style={{ width: contentMaxWidth, display: 'flex', justifyContent: 'flex-start' }}>{!isUpper && !isSession ? <div style={{ paddingLeft: 5, paddingRight: 5 }}>-</div> : ''}
                  <div>
                    {name}
                    {showItemDesc && desc?.length > 1 && <div style={{ fontSize: isUpper ? upperDescFontSize : lowerDescFontSize, fontWeight: 300, width: contentMaxWidth }}>{showItemDesc ? desc : ''}</div>}
                  </div>
                </div>
              </td>
              {
                showPriceAndUnit && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: backgroundColor, verticalAlign: 'middle', width: '8%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end', paddingRight: 1 }}>{qty}</div>
                    <div style={{ width: '50%', display: 'flex', }}>{unit}</div>
                  </div>
                </td>
              }
              {
                showUnitPrice && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: backgroundColor, verticalAlign: 'middle', width: '13%' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    {
                      !isSession && <>
                        <div>{price ? toMoney(price) : ''}</div>
                      </>
                    }
                    {
                      isSession && <div style={{ textAlign: 'right', width: '100%' }}>{price ? price : ''}</div>
                    }
                  </div>
                </td>
              }
              {
                (!showPriceAndUnit && !showUnitPrice) && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', width: '10%', backgroundColor: backgroundColor, verticalAlign: 'middle', width: '13%' }}></td>
              }
              <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: backgroundColor, verticalAlign: 'middle', width: '13%' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
                  <div>{amount ? toMoney(amount) : ''}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    )
  }
  
  const TermDivHeight = ({index, name, desc}) =>{
    return (
      <div style={{ fontWeight: 'bold', minHeight: 'auto', width: '100%', paddingLeft: rowPadding, display: 'flex', fontSize: termFontSize, fontFamily: fontFamily, lineHeight: 1.4, paddingBottom: defaultTermPaddingBottom }}>
        <div style={{width: 25}}>
          <div>{index}:</div>
        </div>
        <div style={{maxWidth: 750}}>
          <div style={{ textDecoration: 'underline' }}>{name}</div>
          <div style={{ paddingBottom: 5 }}>{addLineBreaks(desc)}</div>
        </div>
      </div>
    )
  }

  const RemarkBlock = ({ remark }) => {
    return (
      <div style={{ maxHeight: termListContainerMaxHeight }}>
        <table style={{ width: '100%', marginTop: 15, borderCollapse: 'collapse', fontSize: remarkFontSize }}>
          <tbody>
            <div style={{ fontWeight: 'bold', minHeight: 'auto', width: '100%', paddingLeft: rowPadding, display: 'flex', fontSize: termFontSize, fontFamily: fontFamily, paddingBottom: defaultTermPaddingBottom, fontSize: remarkFontSize }}>
              <div style={{ minWidth: '15mm' }}>
                <div>Remark:</div>
              </div>
              <div style={{ maxWidth: '192mm' }}>
                <TextareaAutosize style={{ fieldSizing: 'content', width: '192mm', resize: 'none', fontSize: remarkFontSize, border: 'none', padding: 1 }} readOnly value={remark} />
              </div>
            </div>
          </tbody>
        </table>
      </div>
    )
  }

  const Page = ({ index, totalPage, ...props}) => {
    return <div className='a4-size print-page card-shadow'
      style={{
        position: 'relative',
        padding: 20,
        marginBottom: 10,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <img src={logo} />
      </div>
      <div>
        <Headers />
        <div>{props.children}</div>
      </div>
      <div style={{ width: '100%', position: 'absolute', bottom: 20, textAlign: 'center', fontSize: 10 }}>
        <div>{companyInfo.addressEn}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 3 }}>
          <div style={{paddingRight: 10}}>Tel : {companyInfo.tel}</div>
          <div style={{paddingRight: 10}}>Fax : {companyInfo.fax}</div>
          <div>Email : {companyInfo.email} </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 20, right: 15, fontSize: 10 }}>
        P.{index + `/${totalPage}`}
      </div>
    </div>
  }

  const Headers = () => {
    return (
      <table style={{ width: '100%', fontWeight: 'bold', fontSize: headerFontSize, }}>
        <thead>
          <tr>
            <td>
              <table width="100%" style={{ tableLayout: 'fixed', marginBottom: 0 }}>
                <colgroup>
                  <col width="*" />
                </colgroup>
                <tbody>
                  <tr>
                    <td className='' colSpan="4%">
                      To
                    </td>
                    <td className='' style={{ textAlign: 'center' }} colSpan="1%">
                      :
                    </td>
                    <td className='' colSpan="70%">
                      {client?.to}
                    </td>
                    <td className='' style={{ textAlign: 'right' }} colSpan="0%">
                    </td>
                    <td className='' colSpan="35%">
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      Quotation No. : {quotation.code.replace(/\^.*/, '')}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='' colSpan="4%">
                      Attn.
                    </td>
                    <td className='' style={{ textAlign: 'center' }} colSpan="1%">
                      :
                    </td>
                    <td className='' colSpan="70%">
                      {client?.attn}
                    </td>
                    <td className='' style={{ textAlign: 'right' }} colSpan="0%">
                    </td>
                    <td className='' colSpan="35%">
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}> 
                       Date : {toDay}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='' colSpan="4%">
                      Addr.
                    </td>
                    <td className='' style={{ textAlign: 'center' }} colSpan="1%">
                      :
                    </td>
                    <td className='' colSpan="74%">
                      {client?.address}
                    </td>
                    <td className='' colSpan="10%">
                    </td>
                    <td className='' colSpan="11%">
                    </td>
                  </tr>
                  <tr>
                    <td className='' colSpan="4%">
                      Email.
                    </td>
                    <td className='' style={{ textAlign: 'center' }} colSpan="1%">
                      :
                    </td>
                    <td className='' colSpan="74%">
                      {client?.email}
                    </td>
                    <td className='' colSpan="10%">
                    </td>
                    <td className='' colSpan="11%">
                    </td>
                  </tr>
                  <tr>
                    <td className='' colSpan="4%">
                      Re.
                    </td>
                    <td className='' style={{ textAlign: 'center' }} colSpan="1%">
                      :
                    </td>
                    <td className='' colSpan="74%">
                      {quotation?.title}
                    </td>
                    <td className='' colSpan="10%">
                    </td>
                    <td className='' colSpan="11%">
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%">
                <tbody>
                  <tr>
                    <td className="arial s20" style={{ textAlign: 'left' }}>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ height: '5px', lineHeight: '5px' }}>&nbsp;</div>
            </td>
          </tr>
        </thead>
      </table>
    )
  }

  const ItemTable = ({ items, index, isLastTypeItem, ...props }) => {
    return (
      <>
        <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: 5, fontSize: 14 }}>QUOTATION</div>
        <Divider style={{ marginBottom: 5 }} />
        <table style={{ width: '100%', border: '1px solid black', marginTop: 15, borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '5%' }}>
                {language._props[localLang].items}
              </th>
              <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: contentMaxWidth }}>
                {language._props[localLang].description}
              </th>
              {
                showPriceAndUnit && <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '10%' }}>
                  {language._props[localLang].quantity}
                </th>
              }
              {
                showUnitPrice && <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '13%' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    <div></div>
                    <div>{language._props[localLang].unitPrice}</div>
                  </div>
                </th>
              }
              {
                (!showPriceAndUnit && !showUnitPrice) && <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '13%' }}></th>
              }
              <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '13%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
                  <div></div>
                  <div>{language._props[localLang].amount}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              items?.map((item, i) => <Item
                key={i}
                index={item.itemNumber}
                isHideNo={item.isHideNo}
                isSession={item.isSession}
                name={item['name_' + dataLang]}
                desc={item['desc_' + dataLang]}
                price={item.price?.value}
                qty={item.price?.quantity}
                unit={item.price?.['unit_' + dataLang]}
                amount={item.price?.amount}
                upper={item.upper}
                child={[]}
              />
              )
            }
          </tbody>
          {
            items[items.length - 1].isLastTypeItem &&
            <tfoot colSpan={5} style={{ fontWeight: 'bold' }}>
              {
                quotation?.totalAmount !== quotation.grandTotal && <tr style={{ height: 'auto', borderTop: '1px solid black' }}>
                  <ItemPageSummeryTd
                    title={`${language._props[localLang].totalAmount}:`}
                    value={toMoney(quotation.totalAmount)}
                  />
                </tr>
              }
              {
                quotation?.ratioDiscount > 0 && <tr style={{ height: 'auto', borderTop: '1px solid black' }}>
                  <ItemPageSummeryTd
                    title={`Discount Off:`}
                    desc={`${quotation.discountRatio ?? 0}%`}
                    value={toMoney(quotation.ratioDiscount)}
                  />
                </tr>
              }
              {
                quotation?.discount > 0 && <tr style={{ height: 'auto', borderTop: '1px solid black' }}>
                  <ItemPageSummeryTd
                    title={'Discount:'}
                    value={toMoney(quotation.discount)}
                  />
                </tr>
              }
              <tr style={{ fontWeight: 'bold', height: 'auto', borderTop: '1px solid black' }}>
                <ItemPageSummeryTd
                  title={quotation?.ratioDiscount > 0 ? `${language._props[localLang].grandTotal}:` : ''}
                  desc={quotation?.ratioDiscount <= 0 ? `${language._props[localLang].grandTotal}:` : ''}
                  value={toMoney(quotation.grandTotal)}
                />
              </tr>
            </tfoot>
          }
        </table>
      </>
    )
  }

  const Item = ({ index, name, desc, price, qty, unit, amount, upper, isHideNo, isSession, child }) => {
    let isUpper = upper == 0;
    let backgroundColor = null;
    if(isSession && showSession) backgroundColor = '#ebebeb';
    else if(isUpper) backgroundColor = '#bcd7f3';
    else backgroundColor = 'white';
    let indexLength = 0;
    let indexWidth = 5;

    try {
      indexLength = index.split('.').length;
      if (indexLength >= 3) {
        indexWidth = indexLength * 5.5;
      }
      if (indexLength > 3) {
        indexWidth += 5;
      }
    } catch (error) {
    }

    return (
      <>
      <tr style={{ fontWeight: 'bold', height: isSession ? sessionHeight : 'auto', fontFamily: fontFamily, fontSize: itemFontSize}}>
        <td style={{...baseTdStyle, verticalAlign: 'middle', backgroundColor: backgroundColor, width: 40, minWidth: 40, maxWidth: 40}}>{isHideNo ? '' : index}</td>
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', paddingLeft: indexWidth, paddingTop: rowPaddingTop, paddingBottom: rowPaddingBottom, backgroundColor: backgroundColor }}>
          <div style={{width: contentMaxWidth, display: 'flex', justifyContent: 'flex-start'}}>{!isUpper && !isSession ? <div style={{paddingLeft: 5, paddingRight: 5}}>-</div> : ''}
          <div>
            {name}
            {showItemDesc && desc?.length > 1 && <div style={{ fontSize: isUpper ? upperDescFontSize : lowerDescFontSize, fontWeight: 300, width: contentMaxWidth }}>{showItemDesc ? desc : ''}</div>}
            </div>

          </div>
        </td>
        { 
        showPriceAndUnit && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: backgroundColor, verticalAlign: 'middle' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3}}>
            <div style={{width: '50%', display: 'flex', justifyContent: 'flex-end', paddingRight: 1 }}>{qty}</div>
            <div style={{width: '50%',  display: 'flex',}}>{unit}</div>
          </div>
        </td>
        }
        {
        showUnitPrice && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: backgroundColor, verticalAlign: 'middle' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
            {
            !isSession && <>
            <div>{price ? toMoney(price) : ''}</div>
            </>
            }
            {
              isSession && <div style={{textAlign: 'right', width: '100%'}}>{price ? price : ''}</div>
            }
          </div>
        </td>
        }
        {
         (!showPriceAndUnit && !showUnitPrice) && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', width: '10%', backgroundColor: backgroundColor, verticalAlign: 'middle' }}></td>
        }
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center', backgroundColor: backgroundColor, verticalAlign: 'middle'}}>
          <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 3, paddingRight: 3}}>
            <div>{amount ? toMoney(amount) : ''}</div>
          </div>
        </td>
      </tr>
      </>
    )
  }

  const ItemPageSummeryTd = ({ title, desc, value }) => {
    return (
      <>
        <td colSpan={showPriceAndUnit && showUnitPrice ? 3 : 2} style={{ ...baseTdStyle, textAlign: 'right' }}>{title}</td>
        <td style={baseTdStyle}>{desc}</td>
        <td style={baseTdStyle}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
            <div>{value ? value : ''}</div>
          </div>
        </td>
      </>
    )
  }

  const TermsTable = ({ items, index, ...props }) => {
    return (
      <div style={{ maxHeight: termListContainerMaxHeight }}>
        <table style={{ width: '100%', marginTop: 15, borderCollapse: 'collapse', fontSize: termFontSize }}>
          <thead>
            <th>
              <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: 5, fontSize: 14 }}>Terms & Conditions</div>
              <Divider style={{marginBottom: 5}}/>
            </th>
          </thead>
          <tbody>
            {
              items?.map((item, i) => <TermDivHeight
                key={i}
                index={item.itemNumber}
                name={item['name_' + dataLang]}
                desc={item['desc_' + dataLang]}
              />
              )
            }
          </tbody>
        </table>
      </div>
    )
  }

  const SignatureBlock = () => {
    return (
    <div style={{paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: upperNameFontSize}}>
      <div style={{textAlign: 'center', width: 200}}>
          <div style={{ borderBottom: '1px solid black', height: companySignatureSize }}>
            {showSignature && <img src={signture} style={{width: companySignatureSize}} />}
          </div>
          <div style={{textAlign: 'left'}}>{REACT_APP_DEFAULT_COMPANY} Limited</div>  
      </div>
        <div style={{ textAlign: 'center', width: 200 }}>
          <div style={{ borderBottom: '1px solid black', height: companySignatureSize }}>
          </div>
          <div style={{textAlign: 'right'}}>Client's signature</div>
        </div>
    </div>)
  }

  const changeLang = () => { 
    // localStorage.setItem('lang', l);
    srtLocaLang(lang == 'en' ? 'zh-hk' : 'en')
    setLang(lang == 'en' ? 'cht' : 'en');
    setDataKeyLang(lang == 'en' ? 'Cht' : 'En');
    setDataLang(lang == 'en' ? 'cht' : 'en');
  }

  const _setItemFontSize = (value) => {
    localStorage.setItem('defaultItemFontSize', value)
    localStorage.setItem('defaultLowerNameFontSize', value - 1)
    localStorage.setItem('defaultUpperDescFontSize', value - 2)
    localStorage.setItem('defaultLowerDescFontSize', value - 2)
    localStorage.setItem('defaultRemarkFontSize', value - 2)
    setItemFontSize(value)
    setLowerNameFontSize(value - 1)
    setUpperDescFontSize(value - 2)
    setLowerDescFontSize(value - 2)
    setRemarkFontSize(value - 2)
  }

  const _setTermFontSize = (value) => {
    localStorage.setItem('defaultTermFontSize', value)
    setTermFontSize(value)
  }

  const SetFontSizeBlock = useCallback(() => {
    return (
      <FormGroup row>
        <button style={{ height: 25, marginRight: 5 }} onClick={() => {
          _setItemFontSize(defaultItemFontSize - 3)
          _setTermFontSize(defaultTermFontSize - 3)
        }}>小</button>
        <button style={{ height: 25, marginRight: 5 }} onClick={() => {
          _setItemFontSize(defaultItemFontSize)
          _setTermFontSize(defaultTermFontSize)
        }}>中</button>
        <button style={{ height: 25, marginRight: 16 }} onClick={() => {
          _setItemFontSize(defaultItemFontSize + 3)
          _setTermFontSize(defaultTermFontSize + 3)
        }}>大</button>
        <button style={{ height: 25, width: 25, marginRight: 5 }} onClick={() => {
          let value = itemFontSize + 1;
          _setItemFontSize(value)
          _setTermFontSize(value - 2)
        }}>+</button>
        <button style={{ height: 25, width: 25, marginRight: 16 }} onClick={() => {
          let value = itemFontSize - 1;
          _setItemFontSize(value)
          _setTermFontSize(value - 2)
        }}>-</button>
        <FormControlLabel sx={{ margin: 0 }} labelPlacement="start" control={<input style={{ width: 23 }} type='number' defaultValue={itemFontSize}
          onBlur={(e) => {
            let value = e.target.value ? parseInt(e.target.value) : defaultItemFontSize;
            _setItemFontSize(value)
          }} />} label="項目" />
        <FormControlLabel labelPlacement="start" control={<input style={{ width: 23 }} type='number' defaultValue={termFontSize} onBlur={(e) => {
          let value = e.target.value ? parseInt(e.target.value) : defaultTermFontSize;
          _setTermFontSize(value)
        }} />} label="條款" />
        <FormControlLabel labelPlacement="start" control={<input style={{ width: 23 }} type='number' defaultValue={remarkFontSize} onBlur={(e) => {
          let value = e.target.value ? parseInt(e.target.value) : defaultRemarkFontSize;
          localStorage.setItem('defaultRemarkFontSize', value)
          setRemarkFontSize(value)
        } } />} label="備註" />
      </FormGroup>
    )
  }, [itemFontSize, termFontSize, remarkFontSize])

  useEffect(()=>{
    query();
  },[lang, showItemDesc, showPriceAndUnit, showUnitPrice, showSignature, showSession, itemFontSize, termFontSize, remarkFontSize])
  
  if(!quotation || queryQuotation.loading) return <BackdropLoading />

  return (
    <>
      {
        <div className="print-view">
          <div className="print-area card-shadow" style={{ width: '210mm', padding: 20 }}>
            <div style={{ padding: 3 }}>
            <Stack>
                <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: 100 }}><strong>語言:</strong></div><div><Button variant="contained" color='success' onClick={changeLang}>{lang == 'en' ? '中文' : '英文'}</Button></div></div>
                <div style={{ display: 'flex' }}><div style={{ width: 100 }}><strong>顯示:</strong></div>
                  <div>
                    <FormGroup row>
                      <FormControlLabel control={<Checkbox checked={showItemDesc} onChange={(e) => { setShowItemDesc(e.target.checked) }} />} label="項目描述" />
                      <FormControlLabel control={<Checkbox checked={showPriceAndUnit} onChange={(e) => { setShowPriceAndUnit(e.target.checked) }} />} label="數量/單位" />
                      <FormControlLabel control={<Checkbox checked={showUnitPrice} onChange={(e) => { setShowUnitPrice(e.target.checked) }} />} label="單價" />
                      <FormControlLabel control={<Checkbox checked={showSignature} onChange={(e) => { setShowSignature(e.target.checked) }} />} label="公司印章" />
                      <FormControlLabel control={<Checkbox checked={showSession} onChange={(e) => { setShowSession(e.target.checked) }} />} label="Session" />
                    </FormGroup>
                  </div>
                </div>
                <div style={{ display: 'flex' }}><div style={{ width: 100 }}><strong>文字大小:</strong></div>
                  <div>
                    <SetFontSizeBlock />
                  </div>
                </div>
            </Stack>
            </div>
          </div>
          <div className="print-area" style={{ width: '220mm', marginBottom: 3, position: 'sticky', top: 0, zIndex: 1 }}>
            <ReactToPrint
              documentTitle={'Quotation-'+quotation.code}
              trigger={() => <Button style={{ width: '100%' }} variant="contained">列印</Button>}
              content={() => componentRef.current}
            />
          </div>
          <ComponentToPrint ref={componentRef}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: fontFamily
              }}
            >
              {
                pages.map((page, i) => {

                  let totalPage = pages.length;
                  if(pages[pages.length - 1][pages[pages.length - 1].length - 1].sumOfRowHeight + signtureBlockHeight > itemListMaxHeight) totalPage = pages.length + 1;

                  let groupedPageItems = page.reduce((acc, obj) => {
                    const key = obj.type;
                    // 如果类型在累加器中不存在，创建一个新的键并初始化为一个空数组
                    if (!acc[key]) {
                      acc[key] = [];
                    }
                    // 将具有相同类型的对象添加到对应的数组中
                    acc[key].push(obj);
                    return acc;
                  }, {});
                  {
                  return <Page key={i} index={i+1} totalPage={totalPage}>
                    {
                       Object.keys(groupedPageItems).map((type, i)=> {
                         if (type === "0")
                           return <ItemTable key={i} items={groupedPageItems[type]} index={i} />
                         if (type === "1")
                          return <RemarkBlock key={i} remark={groupedPageItems[type][0].remark} />
                         if (type === "2")
                           return <TermsTable key={i} items={groupedPageItems[type]} index={i} />
                      })
                    }
                    {
                      i == pages.length - 1 && pages[i][pages[i].length -1].sumOfRowHeight + signtureBlockHeight < itemListMaxHeight && <SignatureBlock />
                    }
                  </Page>
                  }
                })
              }
              {
                pages[pages.length - 1][pages[pages.length - 1].length - 1].sumOfRowHeight + signtureBlockHeight > itemListMaxHeight && <Page index={pages.length + 1} totalPage={pages.length + 1}><SignatureBlock /></Page>
              }
            </div>
          </ComponentToPrint>
        </div>
      }
    </>
  );
};