import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai";
import { FaMobileAlt, FaUserCircle, FaWeixin } from "react-icons/fa";

export default function ({ client, ...props }) {
	return (
		<>
			{(client.nameCht || client.nameEn) && <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{client.nameCht || client.nameEn}</div>}
			{client.tel && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{client.telCode + " " + client.tel}</div>}
			{
				!client.nameCht && !client.nameEn && !client.tel && client.whatsapp && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{client.whatsappCode + " " + client.whatsapp}</div>
			}
			{
				!client.nameCht && !client.nameEn && !client.tel && !client.whatsapp && client.wechat && <div className="flex-cell-div"><FaWeixin size={17} /> &nbsp;{client.wechatCode + " " + client.wechat}</div>
			}
			{
				!client.nameCht && !client.nameEn && !client.tel && !client.whatsapp && !client.wechat && client.email && <div className="flex-cell-div"><AiOutlineMail size={17} /> &nbsp;{client.email}</div>
			}
		</>
	)
}