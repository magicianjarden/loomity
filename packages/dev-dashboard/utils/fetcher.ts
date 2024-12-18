export const fetcher = (url: string) => 
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      throw error;
    });
