export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
}