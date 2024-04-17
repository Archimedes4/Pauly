@main
struct Pauly_Widget: Widget {
    let kind: String = "Pauly_Widget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            Pauly_WidgetEntryView(entry: entry)
                .containerBackground(.maroon, for: .widget)
        }.contentMarginsDisabled()
            .supportedFamilies([.systemSmall])
    }
}