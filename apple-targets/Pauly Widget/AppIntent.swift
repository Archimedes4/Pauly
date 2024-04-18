//
//  AppIntent.swift
//  Pauly Widget
//
//  Created by Andrew Mainella on 2024-04-15.
//

import WidgetKit
import AppIntents

enum RefreshInterval: String, AppEnum {
    case hourly, daily, weekly

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Refresh Interval"
    static var caseDisplayRepresentations: [RefreshInterval : DisplayRepresentation] = [
        .hourly: "Every Hour",
        .daily: "Every Day",
        .weekly: "Every Week",
    ]
}

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "School Day Configuration"
    static var description = IntentDescription("This is a config for a school day widget.")
    
    @Parameter(title: "Refresh", default: .daily)
    var refreshInterval: RefreshInterval
    
    init() {}
}
