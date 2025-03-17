// utils.ts - 问题状态工具函数
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// 将状态数字转换为文本描述
export const statusToText = (status: number): string => {
  switch (status) {
    case 1:
      return '已批准';
    case 2:
      return '已拒绝';
    case 0:
    default:
      return '待审核';
  }
};

// 将状态文本转换为数字
export const statusToNumber = (status: string | number): number => {
  if (typeof status === 'number') {
    return status;
  }
  
  switch (status.toLowerCase()) {
    case 'approved':
      return 1; // 已批准
    case 'rejected':
      return 2; // 已拒绝
    case 'pending':
    default:
      return 0; // 待审核
  }
};

// 将枚举数字转换为状态类型字符串
export const enumToStatus = (statusEnum: number): 'pending' | 'approved' | 'rejected' => {
  switch (statusEnum) {
    case 1:
      return 'approved'; // 已批准
    case 2:
      return 'rejected'; // 已拒绝
    case 0:
    default:
      return 'pending'; // 待审核
  }
};