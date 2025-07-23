@extends('layouts.mail')

@section('body')
    @parent
    <!-- BEGIN BODY // -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateBody" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;background-color: #fff;border-collapse: collapse !important;">
        <tr>
            <td valign="top" class="bodyContent" mc:edit="body_content" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #505050;font-family: Helvetica, Arial, Verdana, sans-serif;font-size: 14px;line-height: 150%;padding-top: 20px;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;border-collapse: collapse !important;">
                    <tr>
                        <td colspan="2" class="tableHeader" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;padding: 1rem 1.5rem;color: #000;background-color: #f2f2f2;width: 30%;">
                            <strong>{{$title ?? ''}}</strong>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td valign="top" class="bodyContent" mc:edit="body_content" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;color: #505050;font-family: Helvetica, Arial, Verdana, sans-serif;font-size: 14px;line-height: 150%;padding-top: 20px;padding-right: 20px;padding-bottom: 20px;padding-left: 20px;text-align: left;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;border-collapse: collapse !important;">
                    @if(isset($data))
                        @foreach ($data as $key => $value)
                            <tr>
                                <td class="tableHeader" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;padding: 1rem 1.5rem;color: #000;background-color: #f2f2f2;width: 30%;">
                                    <strong style="color: #000;">{!! trans('email.key.' . $key) !!}</strong>
                                </td>
                                <td class="tableContent" style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;padding: 1rem 1.5rem;color: #333;">
                                    @if(gettype($value) == 'boolean' && $value == 1)
                                        {{ trans('email.value.yes') }}
                                    @elseif(gettype($value) == 'boolean' && $value == 0)
                                        {{ trans('email.value.no') }}
                                    @elseif($key == 'url')
                                        <a href="{!! $value !!}" target="_blank">{!! $value !!}</a>
                                    @elseif($value == null)
                                        {{ trans('email.value.null') }}
                                    @else
                                        {!! $value !!}
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @endif
                </table>
            </td>
        </tr>
    </table>
    <!-- // END BODY -->
@stop

