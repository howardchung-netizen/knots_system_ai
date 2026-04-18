import { Chip, Tooltip } from '@mui/material';
import React from 'react';
import { InfoCard, InfoRow } from './InfoCard';
import { FaMobileAlt, FaUserCircle, FaWeixin } from 'react-icons/fa';
import { AiOutlineMail, AiOutlineWhatsApp } from 'react-icons/ai';


export default (props) =>{
	const contact = props;
	const { tel, whatsappCode, whatsapp, wechatCode, wechat, email } = contact;

	let title = contact.nameCht || contact.nameEn;
	if(!title && tel) title = contact.telCode + ' ' + contact.tel;
	else if(!title && whatsapp) title = contact.whatsappCode + ' ' + contact.whatsapp;
	else if(!title && wechat) title = contact.wechatCode + ' ' + contact.wechat;
	else if(!title && email) title = contact.email;

	return ( 
		<Tooltip arrow componentsProps={{ tooltip: { style: { backgroundColor: 'none', padding: 0, border: 'none', minWidth: 300 } } }} title={
			<InfoCard title={"聯絡資料"}>
				{(contact.nameCht || contact.nameEn) && <InfoRow label={<FaUserCircle size={17} />} value={contact.nameCht || contact.nameEn} />}
				{contact.tel && <InfoRow label={<FaMobileAlt size={17} />} value={contact.telCode + ' ' + contact.tel} />}
				{contact.whatsapp && <InfoRow label={<AiOutlineWhatsApp size={17} />} value={contact.whatsappCode + ' ' + contact.whatsapp} />}
				{contact.wechat && <InfoRow label={<FaWeixin size={17} />} value={contact.wechatCode + ' ' + contact.wechat} />}
				{contact.email && <InfoRow label={<AiOutlineMail size={17} />} value={contact.email} />}
			</InfoCard>
		} placement="top">
				<Chip label={title} />

		</Tooltip>
	)
}