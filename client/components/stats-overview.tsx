import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Globe, Users } from "lucide-react"

export function StatsOverview() {
    const stats = [
        {
            title: "Total Portfolio Value",
            value: "$314,200",
            change: "+12.5%",
            icon: DollarSign,
            color: "text-accent",
        },
        {
            title: "Active Verses",
            value: "23",
            change: "+3",
            icon: Globe,
            color: "text-primary",
        },
        {
            title: "Total Positions",
            value: "156",
            change: "+18",
            icon: TrendingUp,
            color: "text-chart-4",
        },
        {
            title: "Unique Holders",
            value: "8.2K",
            change: "+5.7%",
            icon: Users,
            color: "text-chart-3",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <Card key={stat.title} className="verse-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-pretty">{stat.value}</div>
                        <p className={`text-xs ${stat.color} flex items-center gap-1 mt-1`}>
                            <TrendingUp className="h-3 w-3" />
                            {stat.change} from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
