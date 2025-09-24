import { getToken } from '@auth/core/jwt';
// Removed Hono dependency

export default function CreateAuth() {
	const auth = async () => {
		// const c = getContext(); // Removed Hono dependency
		const token = await getToken({
			req: c.req.raw,
			secret: process.env.AUTH_SECRET,
			secureCookie: process.env.AUTH_URL.startsWith('https'),
		});
		if (token) {
			return {
				user: {
					id: token.sub,
					email: token.email,
					name: token.name,
					image: token.picture,
				},
				expires: token.exp.toString(),
			};
		}
	};
	return {
		auth,
	};
}
