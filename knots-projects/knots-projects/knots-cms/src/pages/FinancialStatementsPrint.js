import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { ComponentToPrint } from '../components/ComponentToPrint';
import { Button, Checkbox, Divider, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import language from '../localization/language';
import BackdropLoading from '../components/BackdropLoading';
import moment from 'moment';
import { UserContext } from '../contexts/UserContext';
import { addLineBreaks, calculateElementHeight, calculateTextMetrics, toMoney } from '../utils';
import logo from '../assets/logo/knots_logo.png';
import companyInfo from '../constants/companyInfo';
import { PROJECT_INVOICES_QUERY, quotationsQuery } from '../apollo/queries';
import { projectInvoiceFragment, quotationFragment } from '../apollo/fragments';

const signture = require('../../src/assets/logo/knots_signture.png');

const itemListContainerMaxHeight = 860;
const itemListMaxHeight = 860;
const termListContainerMaxHeight = 860;
const termListMaxHeight = 840;
const contentMaxWidth = 460;
const itemPagePriceBlockHeight = 140;
const signtureBlockHeight = 97;
const defaultHeaderFontSize = 10;
const upperNameFontSize = 11;
const lowerNameFontSize = 10;
const upperDescFontSize = 10;
const lowerDescFontSize = 10;
const footerHeight = 31 + 14;
const defaultTermSize = 9;
const defaultRowPadding = 8
const defaultSessionHeight = 18;
const defaultTableHeaderHeight = 22;
const defaultCompanySignatureSize = "19mm";
const fontFamily = 'sans-serif, Arial';
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
  const componentRef = React.useRef();
  const { id } = useParams();
  const [user, userDispatch] = React.useContext(UserContext);
  const [lang, setLang] = React.useState('cht');

  const [query, queryStatus] = useLazyQuery(gql`${PROJECT_INVOICES_QUERY} ${projectInvoiceFragment}`,
  {
    fetchPolicy: 'cache-first',
    variables: {
      id: id,
      first: 1,
    },
    onCompleted: (res) => {  
      if(res.projectInvoices.edges.length > 0) {
        let currentPageItemsHeight = 0;
        let numberOfPages = 0;
        let itemNumber = 0;
        let pages = [[]];
        let terms = [[]];
        let q = res.projectInvoices.edges[0].node;
        setQuotation({
          ...q,
          code: q.quotationNo,
        })
        let qItems = JSON.parse(q.invoice).filter(e=>{
          if(e.isInInvoice) return true
        })

        if (qItems) {
          const listQuotationItem = (qItems, index) => {
            qItems.forEach((e, i) => {
              let item = e;
              item.type = '0'
              item.itemNumber = index ? index + '.' + (i + 1) : i + 1;
              let rowHeight = calculateElementHeight(
                <DivHeight
                  isUpper={true}
                  name={e['name_' + dataLang]}
                  desc={e['desc_' + dataLang]}
                />
              );
              currentPageItemsHeight += rowHeight;
              if (pages[numberOfPages].length == 0) currentPageItemsHeight += defaultTableHeaderHeight;
              item.sumOfRowHeight = currentPageItemsHeight
              if (currentPageItemsHeight > itemListMaxHeight) {
                numberOfPages += 1;
                pages.push([item]);
                currentPageItemsHeight = 0;
              }
              else {
                if (i == qItems.length - 1) item.isLastTypeItem = true;
                pages[numberOfPages].push(item);
              }

              if (e.child?.length) {
                listQuotationItem(e.child, item.itemNumber)
              }

              if(item.upper == 0) {
                let sessionItem = {
                  type: '0',
                  itemNumber: '',
                  name_cht: ' ',
                  name_en: ' ',
                  isSession: true,
                }

                if(i == qItems.length - 1) sessionItem.isLastTypeItem = true;
                sessionItem.rowHeight = sessionHeight;
                currentPageItemsHeight += sessionHeight
                sessionItem.sumOfRowHeight = currentPageItemsHeight;

                pages[numberOfPages].push(sessionItem);
              }
              
            });
          }
          listQuotationItem(qItems);
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
          let _term = JSON.parse(JSON.stringify(q.term));
          if (!_term[0]) {};
          _term.forEach((e, i) => {
            e.type = '1'
            e.itemNumber = i + 1;
            let rowHeight = calculateElementHeight(
              <TermDivHeight
                name={e['name_' + dataLang]}
                desc={e['desc_' + dataLang]}
              />
            );

            currentPageItemsHeight += rowHeight;
            e.sumOfRowHeight = currentPageItemsHeight

            if (currentPageItemsHeight + (i == 0 && pages[numberOfPages].find(e => e.type === "0") ? 400 : 0) > termListMaxHeight) {
              numberOfPages += 1;
              pages.push([e]);
              currentPageItemsHeight = 0;
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
          })
        }
        setPages(pages);
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

  const [quotation, setQuotation] = useState(null);
  const [headerFontSize, setHeaderFontSize] = React.useState(defaultHeaderFontSize);
  const [termFontSize, setTermFontSize] = React.useState(defaultTermSize);
  const [companySignatureSize, setCompanySignatureSize] = React.useState(defaultCompanySignatureSize);
  const [sessionHeight, setSessionHeight] = React.useState(defaultSessionHeight);
  const [client, setClient] = useState(null);
  const [pages, setPages] = useState([]);
  const [items, setItems] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [term, setTerm] = useState(null);
  const currentItemListHeight = useRef(0);

  const DivHeight = ({isUpper, name, desc, isSession}) =>{
    return (
      <div style={{ fontWeight: 'bold', height: isSession ? sessionHeight : 'auto', width: contentMaxWidth, paddingLeft: defaultRowPadding, fontFamily: fontFamily }}>
        <div style={{ fontSize: isUpper ? upperNameFontSize : lowerNameFontSize }}>{!isUpper ? ' - ' : ''}{name}</div>
        {showItemDesc && desc?.length > 1 && <div style={{ fontSize: isUpper ? upperDescFontSize : lowerDescFontSize, fontWeight: 300, paddingBottom: 5}}>{showItemDesc ? desc : ''}</div>}
      </div>
    )
  }
  
  const TermDivHeight = ({index, name, desc}) =>{
    return (
      <div style={{ fontWeight: 'bold', minHeight: 'auto', width: '100%', paddingLeft: defaultRowPadding, display: 'flex', fontSize: termFontSize, fontFamily: fontFamily }}>
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

  const Page = ({ index, ...props}) => {
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
        <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', margin: 5, fontSize: 14 }}>INVOICE</div>
        <Divider />
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
        P.{index + 1 + `/${pages.length}`}
      </div>
    </div>
  }

  const Headers = () => {
    return (
      <table style={{ width: '100%', fontWeight: 'bold', fontSize: headerFontSize }}>
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
                    <td className='' colSpan="74%">
                      {client?.to}
                    </td>
                    <td className='' style={{ textAlign: 'right' }} colSpan="10%">
                      Invoice No :
                    </td>
                    <td className='' colSpan="11%">
                      {quotation.invId}
                    </td>
                  </tr>
                  <tr>
                    <td className='' colSpan="4%">
                      Attn.
                    </td>
                    <td className='' style={{ textAlign: 'center' }} colSpan="1%">
                      :
                    </td>
                    <td className='' colSpan="74%">
                      {client?.attn}
                    </td>
                    <td className='' style={{ textAlign: 'right' }} colSpan="10%">
                      Date :
                    </td>
                    <td className='' colSpan="11%">
                      {moment(quotation.date, 'YYYY-MM-DD').format('Do MMM, YYYY')}
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
                    <td className='' style={{ textAlign: 'right' }} colSpan="10%">
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
      <table style={{ width: '100%', border: '1px solid black', marginTop: 15, borderCollapse: 'collapse', fontSize: upperNameFontSize }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '5%' }}>
              {language._props[localLang].items}
            </th>
            <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: 'auto' }}>
              {language._props[localLang].description}
            </th>
            {
              showPriceAndUnit && <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '8%' }}>
                {language._props[localLang].quantity}
              </th>
            }
            {
              showUnitPrice && <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '10%' }}>
                {language._props[localLang].unitPrice}
              </th>
            }
            {
              (!showPriceAndUnit && !showUnitPrice) && <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '10%' }}></th>
            }
            <th style={{ border: '1px solid black', borderCollapse: 'collapse', width: '10%' }}>
              {language._props[localLang].amount}
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
          <tfoot colSpan={5} style={{fontWeight: 'bold'}}>
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
    )
  }

  const Item = ({ index, name, desc, price, qty, unit, amount, upper, isHideNo, isSession, child }) => {
    let isUpper = upper == 0;
    return (
      <>
      <tr style={{ fontWeight: 'bold', fontSize: isUpper ? upperNameFontSize : lowerNameFontSize, backgroundColor: isUpper ? '#bcd7f3' : 'white', height: isSession ? sessionHeight : 'auto'}}>
        <td style={{...baseTdStyle, verticalAlign: 'middle'}}>{isHideNo ? '' : index}</td>
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', paddingLeft: 5 }}>
        <div>{!isUpper && !isSession ? ' - ' : ''}{name}</div>
          {showItemDesc && desc?.length > 1 && <div style={{ fontSize: isUpper ? upperDescFontSize : lowerDescFontSize, fontWeight: 300, paddingBottom: 5}}>{showItemDesc ? desc : ''}</div>}
        </td>
        { 
        showPriceAndUnit && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3}}>
            <div style={{width: '50%', display: 'flex', justifyContent: 'flex-end', paddingRight: 1 }}>{qty}</div>
            <div style={{width: '50%',  display: 'flex',}}>{unit}</div>
          </div>
        </td>
        }
        {
        showUnitPrice && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' }}>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3}}>
           <div>{price ? 'HK$' : ''}</div>
           <div>{price ? toMoney(price) : ''}</div>
         </div>
        </td>
        }
        {
         (!showPriceAndUnit && !showUnitPrice) && <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', width: '10%' }}></td>
        }
        <td style={{ borderRight: '1px solid black', borderCollapse: 'collapse', textAlign: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3}}>
            <div>{amount ? 'HK$' : ''}</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 3, paddingRight: 3 }}>
            <div>{value ? 'HK$' : ''}</div>
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
          <div style={{textAlign: 'left'}}>Knots Limited</div>  
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

  useEffect(()=>{
    query();
  },[lang, showItemDesc, showPriceAndUnit, showUnitPrice, showSignature])

  if(!quotation || queryStatus.loading) return <BackdropLoading />
  return (
    <>
      {
        <div className="print-view">
          <div className="print-area card-shadow" style={{ width: '210mm', padding: 20 }}>
            <div style={{ padding: 3 }}>
            <Stack>
              <div style={{display: 'flex', alignItems: 'center'}}><div style={{width: 100}}><strong>語言:</strong></div><div><Button variant="contained" color='success' onClick={changeLang}>{lang == 'en' ? 'EN' : '中文'}</Button></div></div>
                <div style={{ display: 'flex'}}><div style={{ width: 100 }}><strong>顯示:</strong></div>
                  <div>
                  <FormGroup row>
                    <FormControlLabel control={<Checkbox checked={showItemDesc} onChange={(e)=>{setShowItemDesc(e.target.checked)}} />} label="項目描述" />
                    <FormControlLabel control={<Checkbox checked={showPriceAndUnit} onChange={(e)=>{setShowPriceAndUnit(e.target.checked)}} />} label="數量/單位"/>
                    <FormControlLabel control={<Checkbox checked={showUnitPrice} onChange={(e)=>{setShowUnitPrice(e.target.checked)}} />} label="單價" />
                    <FormControlLabel control={<Checkbox checked={showSignature} onChange={(e)=>{setShowSignature(e.target.checked)}} />} label="公司印章" />
                  </FormGroup>
                  </div>
                </div>
            </Stack>
            </div>
          </div>
          <div className="print-area" style={{ width: '220mm', marginBottom: 3, position: 'sticky', top: 0, zIndex: 1 }}>
            <ReactToPrint
              documentTitle={'Invoice-'+quotation.invId}
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
                  return <Page key={i} index={i}>
                    {
                       Object.keys(groupedPageItems).map((type, i)=> {
                         if(type === "0")
                         return <ItemTable key={i} items={groupedPageItems[type]} index={i}  />
                        if(type === "1") 
                         return <TermsTable key={i} items={groupedPageItems[type]} index={i} />
                      })
                    }
                    {
                      i == pages.length - 1 && pages[i][pages[i].length - 1].sumOfRowHeight + signtureBlockHeight < itemListMaxHeight && <SignatureBlock />
                    }
                  </Page>
                  }
                })
              }
              {
                pages.length > 0 && (pages[pages.length - 1][pages[pages.length - 1].length - 1].sumOfRowHeight + signtureBlockHeight > itemListMaxHeight) && <Page index={pages.length+1}><SignatureBlock /></Page>
              }
            </div>
          </ComponentToPrint>
        </div>
      }
    </>
  );
};

