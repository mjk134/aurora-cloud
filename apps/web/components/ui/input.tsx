
export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input className="px-[21px] py-2 flex placeholder:text-black placeholder:text-[20px] leading-normal font-medium placeholder:text-opacity-25 items-center rounded-lg border border-sold border-black border-opacity-25 text-black focus:outline-none focus:ring focus:border-blue-400" {...props} />
}