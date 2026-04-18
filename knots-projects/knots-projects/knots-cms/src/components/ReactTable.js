import { CircularProgress, Pagination } from "@mui/material"
import SortIcon from "../assets/SortIcon"
import { flexRender } from "@tanstack/react-table"
import PageLoadingProgress from "./PageLoadingProgress"


export default function ({table, sorting, pageIndex, count, renderRow, onPageIndexChange, loading, ...props}) {
	const _onPageIndexChange = (e, page) => {
		if(onPageIndexChange) onPageIndexChange(e, page)
	}
	return (
		<table className="table">
		<thead>
			{table.getHeaderGroups().map(headerGroup => (
				<tr key={'tr_key'}>
					{headerGroup.headers.map((header, index) => {
						return <th key={"th_"+index} style={{ 
							width: header.column.columnDef.width ?? 'auto'}}>
							<div className="thInner">
								<div className="thInnnerContent">
									<div className="headerText"
										style={{
											textAlign: header.column.columnDef.textAlign ?? 'left',
										}}
										onClick={header.column.getToggleSortingHandler()}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</div>
									{header.column.columnDef.canSort && <button
										className="sortBtn table-header-sort-btn"
										tabIndex="-1"
										type="button"
										aria-label="Sort"
										title="Sort"
										onClick={header.column.getToggleSortingHandler()}>
										{{
											asc: <SortIcon sortBy="asc" />,
											desc: <SortIcon sortBy="dsce" />,
										}[header.column.getIsSorted()] ?? null}
										{
											sorting.length == 0 &&
											<SortIcon />
										}
									</button>}
								</div>
								{
									index < headerGroup.headers.length - 1 && (
										<div className="rightBorderWrap">
											<svg className="" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SeparatorIcon"><path d="M11 19V5h2v14z"></path></svg>
										</div>
									)
								}
							</div>
						</th>
					})}
				</tr>
			))}
		</thead>
		<tbody>
			{loading && <PageLoadingProgress color="inherit" />}
			{table.getRowModel().rows.length == 0 && !loading && <tr><td colSpan="100%" className="text-center">No data found</td></tr>}
			{table.getRowModel().rows.map((row, index) => (
				renderRow(row, index)
			))}
		</tbody>
		<tfoot>
			<tr className="flex items-center gap-2">
				<td colSpan="100%">
					<div>	
						<Pagination 
						color="primary" 
						count={count}
						page={pageIndex} 
						defaultPage={1} 
						onChange={_onPageIndexChange}/>
					</div>
				</td>
			</tr>
		</tfoot>
	</table>
	)
}