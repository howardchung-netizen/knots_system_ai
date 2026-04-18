import { AiOutlineMail, AiOutlineWhatsApp } from "react-icons/ai"
import { FaMobileAlt, FaUserCircle, FaWeixin } from "react-icons/fa"

const InfoRow = ({label, value})=>{
	return <div>
   <strong>{label}</strong> : {value}
	</div>
}

export const ClientSelectItem= (props) => {
	return (
		<>
			<div style={{ padding: 3 }}>
					 {(props.companyCht || props.companyEn) && <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{props.companyCht || props.companyEn}</div>}
					 {/* {props.tel && <div className="flex-cell-div"><FaMobileAlt size={17} /> &nbsp;{props.telCode + " " + props.tel}</div>}
					 {
						!props.companyCht && !props.companyEn && !props.tel && props.whatsapp && <div className="flex-cell-div"><AiOutlineWhatsApp size={17} /> &nbsp;{props.whatsappCode + " " + props.whatsapp}</div>
					 }
					 {
						!props.companyCht && !props.companyEn && !props.tel && !props.whatsapp && props.wechat && <div className="flex-cell-div"><FaWeixin size={17} /> &nbsp;{props.wechatCode + " " + props.wechat}</div>
					 }
					 {
						!props.companyCht && !props.companyEn && !props.tel && !props.whatsapp && !props.wechat && props.email && <div className="flex-cell-div"><AiOutlineMail size={17} /> &nbsp;{props.email}</div>
					 } */}
					</div>
		</>
	)
}

export const ClientContractSelectItem= (props) => {
	const Item = () => {
		if (props.nameCht && props.nameEn) return <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{props.nameCht} { ` | ${props.nameEn}`}</div>
    else if (props.nameCht) return <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{props.nameCht}</div>
		else if (props.nameEn) return <div className="flex-cell-div"><FaUserCircle size={17} />  &nbsp;{props.nameEn}</div>
	}
	return (
		<>
			<div style={{ padding: 3 }}>
				<Item />
			</div>
		</>
	)
}
