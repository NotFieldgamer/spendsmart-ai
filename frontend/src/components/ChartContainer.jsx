export default function ChartContainer({height = 300 , children}) {
    return (
        <div className="w-full" style={{height , minHeight: height}}>
            {children}
        </div>
    );
}