import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*'
    ]
};

const middleware = (req: NextRequest) => {
    const accessCookie = req.cookies.get('accessToken');
    const hasToken = accessCookie && accessCookie.value;

    if (hasToken) {
        if (req?.nextUrl?.pathname == '/')
            return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    }
    else if (req?.nextUrl?.pathname != '/')
        return NextResponse.redirect(new URL('/', req.nextUrl.origin));

    return NextResponse.next();
};

export default middleware;
