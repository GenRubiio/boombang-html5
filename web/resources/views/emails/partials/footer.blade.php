<table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateFooter" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #4a4a4a;border-top: 1px solid #FFFFFF;border-collapse: collapse !important;">
	<tr>
		<td valign="top" class="footerContent" mc:edit="footer_content00" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-weight: 400;font-family: Helvetica, Arial, Verdana, sans-serif;line-height: 150%;text-align: left;padding: 2rem 1.5rem;font-size: 12px;background: #f2f2f2;color: #333;">
			<h1 style="text-align: center;color:#444444;display: block;font-family: Helvetica, Arial, Verdana, sans-serif;font-size: 18px;font-style: normal;font-weight: bold;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;">
				{{ env('APP_NAME') }}
			</h1>
			{{trans('email.copyright')}}
		</td>
	</tr>
	{{--
	<tr>
		<td valign="top" class="footerContent" mc:edit="footer_content01" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-weight: 400;font-family: Helvetica, Arial, Verdana, sans-serif;line-height: 150%;text-align: left;padding: 2rem 1.5rem;font-size: 12px;background: #f2f2f2;color: #333;">
			<h1 style="display: block;font-family: Helvetica, Arial, Verdana, sans-serif;font-size: 18px;font-style: normal;font-weight: bold;line-height: 100%;letter-spacing: normal;margin-top: 0;margin-right: 0;margin-bottom: 10px;margin-left: 0;text-align: left;"><strong style="color: #444444;">Síguenos:</strong></h1>
			<a href="https://www.facebook.com/" class="" target="_blank" rel="nofollow" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;text-decoration: underline;color: #fff;margin: 0rem .2rem;">
				<img src="{!!asset('images/facebook.png')!!}" alt="logo facebook">
			</a>
			<a href="https://www.instagram.com/" class="" target="_blank" rel="nofollow" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;text-decoration: underline;color: #fff;margin: 0rem .2rem;">
				<img src="{!!asset('images/instagram.png')!!}" alt="logo instagram">
			</a>
		</td>
	</tr>
	--}}
	{{--
	<tr>
		<td colspan="2" valign="top" class="footerLegal" style="padding-top: 30px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;font-weight: 400;font-family: Helvetica, Arial, Verdana, sans-serif;line-height: 150%;padding: 1.5rem 1rem;font-size: 10px;color: #fff;background-color: #4a4a4a;text-align: center;" mc:edit="footer_content02">
			<a href="{{url(getPageSlugFromId(18))}}" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;text-decoration: underline;color: #fff;margin: 0rem .2rem;">
				{!!trans('email.politica_cookies')!!}
			</a> |
			<a href="{{url(getPageSlugFromId(19))}}" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;text-decoration: underline;color: #fff;margin: 0rem .2rem;">
				{!!trans('email.aviso_legal')!!}
			</a> |
			<a href="{{url(getPageSlugFromId(20))}}" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;text-decoration: underline;color: #fff;margin: 0rem .2rem;">
				{!!trans('email.politica_privacidad')!!}
			</a>
		</td>
	</tr>
	--}}
</table>
