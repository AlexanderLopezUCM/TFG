import { getToken } from "@/actions";

type Foo = {
	[key: string]: any;
};

export const authFetch = async (url: string | URL | globalThis.Request, init: RequestInit & { headers?: Foo }) => {
	// console.log("> Init headers (first): ", init.headers);

	//  Fetch authentication token
	// console.log("> Fetching cookie");
	const cookie = await getToken();

	//  Raise error if not found cookie or token
	if (!cookie || !cookie.value) throw new Error("Authorization missing");

	// console.log("> Cookie is valid");

	const token = cookie.value;

	// console.log("> Token: ", token);

	//  Add authentication header to init
	// console.log("> Init: ", init);
	// console.log("> Init headers: ", init.headers);

	const requestHeaders = new Headers();

	// const requestHeaders = new Headers(init.headers);

	if (init.headers) Object.keys(init.headers as Foo).forEach((key) => requestHeaders.append(key, (init.headers as Foo)[key]));

	requestHeaders.append("Authorization", `Bearer ${token}`);

	// requestHeaders.set("Authorization", `Bearer ${token}`);

	// console.log("> New request headers: ", requestHeaders.get("Authorization"));

	init.headers = requestHeaders;

	// console.log("> Init headers: ", init.headers);

	// console.log("> Auth fetch url and init: ", url, init);

	//  Perform fetch
	return fetch(url, init);
};
