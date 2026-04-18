export const telCodes = ["86", "852", "853", "886"];
export const appellation = [
	{nameCht: 'N/A', nameEn: 'N/A', value: 0 },
	{nameCht: '先生', nameEn: 'Mr.', value: 1 },
	{nameCht: '小姐', nameEn: 'Ms.', value: 2 },
	{nameCht: '女士', nameEn: 'Ms.', value: 3 },
]
export const userStatus = [
	{label: '正常', value: 1},
	{label: '封鎖', value: 2},
	{label: '停職', value: 3},
	{label: '離職', value: 4},
]

export const FinancialYearList = (()=>{
  let startYear = new Date().getFullYear() - 2;
  let list = [];
  for(let i = 0; i < 5; i++){
    list.push({
      label: `${startYear+i}-${startYear+i+1}`,
      value: `${startYear+i}-${startYear+i+1}`
    })
  }
  return list;
})()

export const bookKeepingPeriodInputOptions = [
'Weekly',
'Monthly',
'Yearly',
'Quarterly',
]


export const bookKeepingPeriodDayOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32
  ]

export const bookKeepingPeriodWeekOptions = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  ]

export const bookKeepingPeriodMonthOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12
  ]

export const defaultPalette = [
    "#ff43f9",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#9e9e9e",
    "#607d8b"
  ]