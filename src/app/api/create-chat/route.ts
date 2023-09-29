import {NextResponse} from "next/server";

export async function POST(req: Request, res: Response) {
	try {
		const body = await req.json();
		if (!body) {
			return NextResponse.json({error: "Invalid request body"}, {status: 400});
		}

		const { fileKey, fileName } = body;
		if (!fileKey || !fileName) {
			return NextResponse.json({error: "Invalid request body. FileKey and FileName is mandatory"}, {status: 400});
		}

		console.log({fileKey, fileName});

		return NextResponse.json({message: 'Success!'}, {status: 200});
	} catch (error) {
		console.error(error);

		return NextResponse.json({error: "Internal server error"}, {status: 500});
	}
}
