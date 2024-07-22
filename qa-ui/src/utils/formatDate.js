export const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const padZero = (number) => (number < 10 ? '0' : '') + number;

    return `${padZero(hours)}:${padZero(minutes)} ${padZero(day)}/${padZero(month)}/${year}`;
}