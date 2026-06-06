/**
 * Lista de domínios de e-mail descartáveis/temporários conhecidos.
 * Usada para bloquear cadastros abusivos.
 */
export const DOMINIOS_DESCARTAVEIS = new Set([
  // Mailinator e variantes
  'mailinator.com', 'mailinater.com', 'mailinator2.com', 'mailinator.net',
  'suremail.info', 'spamgourmet.com', 'spamgourmet.net', 'tradermail.info',
  // Guerrillamail
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.de',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamailblock.com', 'grr.la',
  'spam4.me', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
  // 10 minute mail
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.de',
  '10minutemail.co.uk', '10minutemail.info', '10minutemail.us', '10minemail.com',
  'tempr.email', 'tempinbox.com', 'tempinbox.co.uk',
  // Throwam / Trashmail
  'throwam.com', 'trashmail.at', 'trashmail.com', 'trashmail.io',
  'trashmail.me', 'trashmail.net', 'trashmail.org', 'trashmailer.com',
  'trash-mail.at', 'dispostable.com', 'discard.email',
  // Fakeinbox / Spamfree
  'fakeinbox.com', 'spamfree24.org', 'spamfree24.de', 'spamfree24.net',
  'spamfree24.info', 'spamfree24.eu', 'spam.la', 'spam.su',
  // Temp-mail e similares
  'temp-mail.org', 'temp-mail.ru', 'temp-mail.io', 'tempmail.com',
  'tempmail.net', 'tempmail.org', 'tempmail.de', 'tempmail.it',
  'tempmail.us', 'tmpmail.net', 'tmpmail.org', 'tmpeml.com',
  'getairmail.com', 'jetable.com', 'jetable.fr.nf', 'jetable.net',
  'jetable.org', 'filzmail.com',
  // Mailnull / maildrop
  'mailnull.com', 'maildrop.cc', 'mailnesia.com', 'mailbucket.org',
  'mailscrap.com', 'mailsiphon.com', 'mailslapping.com', 'mailzilla.org',
  // Sharklasers e variantes
  'sharklasers.com', 'guerrillamail.info', 'grr.la', 'guerrillamailblock.com',
  'spam4.me', 'odaymail.com',
  // Outros populares
  'throwaway.email', 'throwam.com', 'throwam.net', 'throwam.org',
  'moakt.com', 'moakt.cc', 'moakt.ws', 'moakt.co',
  'fake-box.com', 'fakemailz.com', 'fakemail.fr', 'fakemail.net',
  'yomail.info', 'inoutmail.de', 'inoutmail.eu', 'inoutmail.net',
  'inoutmail.info', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'spamgob.com', 'spamhereplease.com', 'spamherelots.com', 'spamoff.de',
  'spamspot.com', 'spamthisplease.com',
  // Mailexpire
  'mailexpire.com', 'mailfreeonline.com', 'mailguard.me',
  'mailhazard.com', 'mailhazard.us', 'mailimate.com', 'mailin8r.com',
  'mailinblack.com', 'mailme.ir', 'mailme.lv', 'mailme24.com',
  'mailmetrash.com', 'mailmoat.com', 'mailnew.com', 'mailpick.biz',
  'mailrock.biz', 'mailscrap.com', 'mailseal.de',
  // Spambox
  'spambox.us', 'spambox.info', 'spambox.org', 'spambox.irishspringrealty.com',
  // 33mail / 1secmail
  '33mail.com', '1secmail.com', '1secmail.net', '1secmail.org',
  'eoopy.com', 'emlpro.com', 'emailondeck.com', 'emailtemporar.ro',
  'emailtemporario.com.br', 'emltmp.com',
  // Burner mail
  'burnermail.io', 'burnthespam.info',
  // Correos temporales BR
  'lixo.email', 'temporarymail.com', 'correotemporal.org',
  'correios.net', 'descartavel.com', 'emailtemporario.com.br',
  // Inbox.lt e outros
  'inbox.lt', 'dispostable.com', 'discardmail.com', 'discardmail.de',
  'no-spam.ws', 'nospam.ze.tc', 'nospamfor.us', 'nospamthanks.info',
  // EmailOnDeck e similares
  'emailondeck.com', 'emailsensei.com', 'emailtemporanea.com',
  'emailtemporary.com', 'emailthe.net', 'emailto.de', 'emailwarden.com',
  // Binkmail
  'binkmail.com', 'bmpk.org', 'bobmail.info', 'bodhi.lawlita.com',
  'bofthew.com', 'bootybay.de',
  // Classicos
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  'hmamail.com', 'e4ward.com', 'anonymizer.com',
  // Adgard/Addy
  'adgard.de', 'adguru.net', 'adwaterr.com', 'aeomail.com',
])

/**
 * Verifica se um domínio de e-mail é descartável/temporário.
 */
export function isDominioDescartavel(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return false
  return DOMINIOS_DESCARTAVEIS.has(domain)
}
