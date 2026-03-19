!macro customInstall
  ; Register Simple Softphone as a capable application for tel: and sip: protocols
  ; This makes it appear in Windows Settings > Default Apps > tel

  ; App registration with capabilities
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone" "" "Simple Softphone"
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone\DefaultIcon" "" "$INSTDIR\Simple Softphone.exe,0"
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone\shell\open\command" "" '"$INSTDIR\Simple Softphone.exe" "%1"'

  ; Declare app capabilities
  WriteRegStr HKCU "Software\SimpleSoftphone\Capabilities" "ApplicationName" "Simple Softphone"
  WriteRegStr HKCU "Software\SimpleSoftphone\Capabilities" "ApplicationDescription" "AI-powered WebRTC SIP client"

  ; URL protocol associations under capabilities
  WriteRegStr HKCU "Software\SimpleSoftphone\Capabilities\URLAssociations" "tel" "SimpleSoftphone"
  WriteRegStr HKCU "Software\SimpleSoftphone\Capabilities\URLAssociations" "sip" "SimpleSoftphone"

  ; Register tel: protocol handler class
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.tel" "" "URL:Tel Protocol"
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.tel" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.tel\DefaultIcon" "" "$INSTDIR\Simple Softphone.exe,0"
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.tel\shell\open\command" "" '"$INSTDIR\Simple Softphone.exe" "%1"'

  ; Register sip: protocol handler class
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.sip" "" "URL:SIP Protocol"
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.sip" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.sip\DefaultIcon" "" "$INSTDIR\Simple Softphone.exe,0"
  WriteRegStr HKCU "Software\Classes\SimpleSoftphone.sip\shell\open\command" "" '"$INSTDIR\Simple Softphone.exe" "%1"'

  ; Register as a known application in Windows (this is what makes it appear in Default Apps)
  WriteRegStr HKCU "Software\RegisteredApplications" "SimpleSoftphone" "Software\SimpleSoftphone\Capabilities"
!macroend

!macro customUnInstall
  ; Clean up all registry entries on uninstall
  DeleteRegKey HKCU "Software\Classes\SimpleSoftphone"
  DeleteRegKey HKCU "Software\Classes\SimpleSoftphone.tel"
  DeleteRegKey HKCU "Software\Classes\SimpleSoftphone.sip"
  DeleteRegKey HKCU "Software\SimpleSoftphone"
  DeleteRegValue HKCU "Software\RegisteredApplications" "SimpleSoftphone"
!macroend
