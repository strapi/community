const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

const jsonToLHS = (obj: JSON, parentKey: string = ''): string => {
  let result = [];

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Create the new key by appending the current key in bracket syntax
      const newKey = parentKey ? `${parentKey}[${key}]` : key;

      // If the value is an object, recursively process its keys
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result.push(jsonToLHS(obj[key], newKey));
      } else {
        // If it's a primitive value, add it as a key-value pair
        result.push(`${newKey}=${encodeURIComponent(obj[key])}`);
      }
    }
  }

  return result.join('&');
};

const query = (path: string, filters?: JSON, authenticated: boolean = true) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  if (authenticated) {
    headers.append('Authorization', `Bearer ${BEARER_TOKEN}`);
  }

  if (filters) {
    path += `?${jsonToLHS(filters)}`;
  }

  return fetch(path, {
    headers,
  })
    .then((response) => response.json())
    .catch((error) => new Error(error));
};

// Example usage:
// const jsonObj = {
// 	user: {
// 			name: 'John Doe',
// 			details: {
// 					age: 30,
// 					city: 'San Francisco'
// 			}
// 	},
// 	preferences: {
// 			notifications: true,
// 			theme: 'dark'
// 	}
// };

export function fetchMany(type: string, filters: JSON) {
  return query(`${CMS_URL}/api/${type}`, filters);
}

export function countMany(type: string, filters?: JSON) {
  return query(`${CMS_URL}/api/${type}/count`, filters);
}
